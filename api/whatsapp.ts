// WhatsApp webhook for the /currently-working-on tracker.
// Meta calls GET once to verify the URL, then POSTs every incoming message.
// Logging a session commits a line to content/tracker/log.yaml, which redeploys the site.
import { createHmac, timingSafeEqual } from "node:crypto";
import { parse as parseYaml } from "yaml";
import {
  HELP,
  appendEntries,
  dayProgress,
  describeEntry,
  itemTitles,
  parseMessage,
  readEntries,
  removeLastEntry,
  renderDay,
  todayIn,
  type Entry,
  type Task,
} from "./_lib/bot.js";
import { nextItems, readQueue, readSchedule, type Queue, type Schedule } from "../src/lib/schedule.js";

const env = (name: string) => process.env[name] ?? "";
const REPO = () => env("GITHUB_REPO") || "vikram-gsu/vrblog";
const BRANCH = () => env("GITHUB_BRANCH") || "main";
const LOG_PATH = "content/tracker/log.yaml";

// --- GitHub ---------------------------------------------------------------

async function github(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`https://api.github.com/repos/${REPO()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env("GITHUB_TOKEN")}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
  });
}

async function readFile(path: string): Promise<{ text: string; sha: string }> {
  const res = await github(`/contents/${path}?ref=${BRANCH()}`);
  if (!res.ok) throw new Error(`GitHub read ${path}: ${res.status}`);
  const body = (await res.json()) as { content: string; sha: string };
  return { text: Buffer.from(body.content, "base64").toString("utf8"), sha: body.sha };
}

async function writeFile(path: string, text: string, sha: string, message: string) {
  return github(`/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(text).toString("base64"),
      sha,
      branch: BRANCH(),
    }),
  });
}

/** Meta retries deliveries it thinks failed; the message id in recent commits marks it handled. */
async function alreadyHandled(messageId: string): Promise<boolean> {
  const res = await github(`/commits?path=${LOG_PATH}&sha=${BRANCH()}&per_page=20`);
  if (!res.ok) return false;
  const commits = (await res.json()) as { commit: { message: string } }[];
  return commits.some((c) => c.commit.message.includes(messageId));
}

/** Reads, edits and writes log.yaml, retrying once if someone else committed in between. */
async function updateLog(
  edit: (yaml: string) => string | null,
  message: string
): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { text, sha } = await readFile(LOG_PATH);
    const next = edit(text);
    if (next === null) return false;
    const res = await writeFile(LOG_PATH, next, sha, message);
    if (res.ok) return true;
    if (res.status !== 409) throw new Error(`GitHub write: ${res.status} ${await res.text()}`);
  }
  throw new Error("GitHub write kept conflicting");
}

// --- WhatsApp -------------------------------------------------------------

function validSignature(raw: string, header: string | null): boolean {
  // Unconfigured means closed: an empty secret would make signatures forgeable.
  if (!env("WHATSAPP_APP_SECRET") || !header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", env("WHATSAPP_APP_SECRET")).update(raw).digest();
  const given = Buffer.from(header.slice("sha256=".length), "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

async function reply(to: string, body: string) {
  const version = env("WHATSAPP_GRAPH_VERSION") || "v23.0";
  const res = await fetch(
    `https://graph.facebook.com/${version}/${env("WHATSAPP_PHONE_NUMBER_ID")}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env("WHATSAPP_ACCESS_TOKEN")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
    }
  );
  if (!res.ok) console.error("WhatsApp reply failed", res.status, await res.text());
}

interface IncomingMessage {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
}

function messagesIn(payload: unknown): IncomingMessage[] {
  const entries = (payload as { entry?: { changes?: { value?: { messages?: IncomingMessage[] } }[] }[] })
    .entry ?? [];
  return entries.flatMap((e) => (e.changes ?? []).flatMap((c) => c.value?.messages ?? []));
}

// --- Commands -------------------------------------------------------------

async function loadPlan(): Promise<{ tasks: Task[]; queue: Queue; schedule: Schedule }> {
  const [plan, queue, schedule] = await Promise.all([
    readFile("content/tracker/plan.yaml"),
    readFile("content/tracker/queue.yaml"),
    readFile("content/tracker/schedule.yaml"),
  ]);
  const groups = (parseYaml(plan.text)?.groups ?? []) as { tasks: Task[] }[];
  return {
    tasks: groups.flatMap((g) => g.tasks.map((t) => ({ id: t.id, label: t.label }))),
    queue: readQueue(parseYaml(queue.text)),
    schedule: readSchedule(parseYaml(schedule.text)),
  };
}

async function handle(msg: IncomingMessage): Promise<string> {
  if (msg.type !== "text" || !msg.text) return "I only understand text messages.\n\n" + HELP;

  const today = todayIn(env("TRACKER_TZ") || "America/New_York");
  const { tasks, queue, schedule } = await loadPlan();
  const titles = itemTitles(queue);
  const commands = parseMessage(msg.text.body, today, new Set(tasks.map((t) => t.id)));
  if (commands.length === 0) return HELP;

  const unknown = commands.find((c) => c.kind === "unknown");
  if (unknown) return `Didn't understand "${unknown.text}".\n\n${HELP}`;

  if (commands.some((c) => c.kind === "help")) return HELP;

  const toLog = commands.flatMap((c) => (c.kind === "log" ? [c] : []));
  const replies: string[] = [];

  if (commands.some((c) => c.kind === "undo")) {
    let removed: Entry | undefined;
    await updateLog((yaml) => {
      const result = removeLastEntry(yaml);
      removed = result.removed;
      return result.removed ? result.yaml : null;
    }, `tracker: undo via WhatsApp (${msg.id})`);
    replies.push(removed ? `Removed: ${removed.date} · ${describeEntry(removed, tasks, titles)}` : "Nothing to undo.");
  }

  if (toLog.length) {
    let logged: Entry[] = [];
    await updateLog((yaml) => {
      // "done" finishes the next unfinished items, counting earlier lines of this message.
      const log = readEntries(yaml);
      logged = toLog.map(({ entry, doneNext }) => {
        const e = doneNext ? { ...entry, done: nextItems(queue, log, entry.task, doneNext).map((i) => i.id) } : entry;
        if (e.done && !e.done.length) delete e.done;
        log.push(e);
        return e;
      });
      return appendEntries(yaml, logged);
    }, `tracker: log ${toLog.map((c) => describeEntry(c.entry, tasks)).join(", ")} (${msg.id})`);
    const lines = logged.map((e) => `✅ ${e.date === today ? "" : `${e.date} · `}${describeEntry(e, tasks, titles)}`);
    const entries = readEntries((await readFile(LOG_PATH)).text);
    const progress = dayProgress(today, queue, schedule, entries);
    replies.push([...lines, progress && `\n${progress}`, "Site updates in about a minute."].filter(Boolean).join("\n"));
  }

  for (const c of commands) {
    if (c.kind === "today") {
      const entries = readEntries((await readFile(LOG_PATH)).text);
      replies.push(renderDay(c.date, today, tasks, queue, schedule, entries));
    }
  }

  return replies.join("\n\n");
}

// --- HTTP -----------------------------------------------------------------

/** Meta's one-time verification handshake when you register the webhook URL. */
export function GET(request: Request): Response {
  const url = new URL(request.url);
  const ok =
    url.searchParams.get("hub.mode") === "subscribe" &&
    env("WHATSAPP_VERIFY_TOKEN") !== "" &&
    url.searchParams.get("hub.verify_token") === env("WHATSAPP_VERIFY_TOKEN");
  return ok
    ? new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 })
    : new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request): Promise<Response> {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-hub-signature-256"))) {
    return new Response("Bad signature", { status: 401 });
  }

  const allowed = env("WHATSAPP_ALLOWED_FROM").replace(/\D/g, "");
  for (const msg of messagesIn(JSON.parse(raw))) {
    if (!allowed || msg.from !== allowed) {
      console.warn("Ignoring message from unlisted number", msg.from);
      continue;
    }
    try {
      if (await alreadyHandled(msg.id)) continue;
      await reply(msg.from, await handle(msg));
    } catch (err) {
      console.error(err);
      await reply(msg.from, `Something went wrong, nothing was logged.\n${String(err).slice(0, 300)}`);
    }
  }
  // Always 200 once the signature checks out, or Meta keeps retrying.
  return new Response("OK", { status: 200 });
}
