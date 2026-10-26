// Pure logic for the WhatsApp tracker bot: parse messages, edit log.yaml, write replies.
// No I/O here, so it can be tested with `npm test`.
import { parse as parseYaml, parseDocument, YAMLSeq } from "yaml";

export interface Task {
  id: string;
  label: string;
}

export interface Entry {
  date: string;
  task: string;
  minutes?: number;
  note?: string;
}

export type Command =
  | { kind: "log"; entry: Entry }
  | { kind: "today"; date: string }
  | { kind: "undo" }
  | { kind: "help" }
  | { kind: "unknown"; text: string };

type Agenda = Record<string, Record<string, { title: string }[]>>;

// Short names you can type instead of a task id.
const ALIASES: Record<string, string> = {
  llm: "llm-from-scratch",
  raschka: "llm-from-scratch",
  ddia: "ddia",
  kleppmann: "ddia",
  xu: "system-design-xu",
  sdi: "system-design-xu",
  paper: "blogs-papers",
  papers: "blogs-papers",
  blog: "blogs-papers",
  blogs: "blogs-papers",
  lc: "leetcode",
  leet: "leetcode",
  leetcode: "leetcode",
  agent: "agents",
  agents: "agents",
  harness: "agent-harnesses",
  harnesses: "agent-harnesses",
  exp: "experiments",
  experiment: "experiments",
  experiments: "experiments",
  buffer: "experiments",
  algo: "algorithms-lectures",
  algos: "algorithms-lectures",
  lecture: "algorithms-lectures",
  lectures: "algorithms-lectures",
  video: "algorithms-lectures",
  videos: "algorithms-lectures",
  sd: "system-design-lab",
  lab: "system-design-lab",
  sdlab: "system-design-lab",
  server: "agents",
};

export const HELP = [
  "Log a session: <task> [time] [note]",
  "  ddia 45 ch8 isolation levels",
  "  lc 1h two problems",
  "  yesterday llm 90 ch2",
  "  10/22 xu 2h",
  "",
  "Tasks: llm, ddia, xu, papers, algo, lc, sd, agents (or server), harness, exp",
  "Time: 45, 45m, 1h, 1h30, 1.5h (optional)",
  "",
  "Other: today (or ?), yesterday?, undo, help",
].join("\n");

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Today's date (YYYY-MM-DD) in the given IANA time zone. */
export function todayIn(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);
}

export function parseMinutes(token: string): number | undefined {
  const t = token.toLowerCase();
  let m = t.match(/^(\d+)m?$/);
  if (m) return Number(m[1]);
  m = t.match(/^(\d+(?:\.\d+)?)h$/);
  if (m) return Math.round(Number(m[1]) * 60);
  m = t.match(/^(\d+)h(\d+)m?$/);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  return undefined;
}

function parseDateToken(token: string, today: string): string | undefined {
  const t = token.toLowerCase();
  if (t === "today") return today;
  if (t === "yesterday" || t === "yday") return addDays(today, -1);
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (m) {
    const year = today.slice(0, 4);
    const date = `${year}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
    // "12/30" sent on Jan 2 means last year.
    return date > today ? `${Number(year) - 1}${date.slice(4)}` : date;
  }
  return undefined;
}

function resolveTask(token: string, taskIds: Set<string>): string | undefined {
  const t = token.toLowerCase();
  if (taskIds.has(t)) return t;
  const id = ALIASES[t];
  return id && taskIds.has(id) ? id : undefined;
}

/** Parses one line of a message. A message may hold several lines, one command each. */
export function parseLine(line: string, today: string, taskIds: Set<string>): Command {
  const text = line.trim();
  const lower = text.toLowerCase();
  if (lower === "help" || lower === "h") return { kind: "help" };
  if (lower === "undo") return { kind: "undo" };
  if (lower === "today" || lower === "?" || lower === "today?") return { kind: "today", date: today };
  if (lower === "yesterday?") return { kind: "today", date: addDays(today, -1) };

  const tokens = text.split(/\s+/);
  let date = today;
  const maybeDate = parseDateToken(tokens[0] ?? "", today);
  if (maybeDate && tokens.length > 1) {
    date = maybeDate;
    tokens.shift();
  }

  const task = resolveTask(tokens.shift() ?? "", taskIds);
  if (!task) return { kind: "unknown", text };

  const entry: Entry = { date, task };
  const minutes = tokens.length ? parseMinutes(tokens[0]) : undefined;
  if (minutes !== undefined) {
    entry.minutes = minutes;
    tokens.shift();
  }
  const note = tokens.join(" ").trim();
  if (note) entry.note = note;
  return { kind: "log", entry };
}

export function parseMessage(body: string, today: string, taskIds: Set<string>): Command[] {
  return body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => parseLine(l, today, taskIds));
}

export function readEntries(logYaml: string): Entry[] {
  const data = (parseYaml(logYaml) || {}) as { entries?: Entry[] };
  return (data.entries || []).map((e) => ({ ...e, date: String(e.date).slice(0, 10) }));
}

/** Appends entries to log.yaml, keeping its comments and existing formatting. */
export function appendEntries(logYaml: string, entries: Entry[]): string {
  const doc = parseDocument(logYaml);
  let seq = doc.get("entries");
  if (!(seq instanceof YAMLSeq)) {
    seq = new YAMLSeq();
    doc.set("entries", seq);
  }
  const list = seq as YAMLSeq;
  list.flow = false; // "entries: []" becomes a block list
  for (const entry of entries) {
    list.add(doc.createNode(entry, { flow: true }));
  }
  return doc.toString({ lineWidth: 0 });
}

/** Removes the last entry. Returns the new YAML and what was removed (if anything). */
export function removeLastEntry(logYaml: string): { yaml: string; removed?: Entry } {
  const doc = parseDocument(logYaml);
  const seq = doc.get("entries");
  if (!(seq instanceof YAMLSeq) || seq.items.length === 0) return { yaml: logYaml };
  const removed = (seq.items.pop() as { toJSON(): Entry }).toJSON();
  if (seq.items.length === 0) seq.flow = true; // back to "entries: []"
  return { yaml: doc.toString({ lineWidth: 0 }), removed };
}

function prettyDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function labelOf(tasks: Task[], id: string): string {
  return tasks.find((t) => t.id === id)?.label ?? id;
}

export function describeEntry(entry: Entry, tasks: Task[]): string {
  return [
    labelOf(tasks, entry.task),
    entry.minutes ? `${entry.minutes} min` : null,
    entry.note ? `"${entry.note}"` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** The day's assignments with a check for each task that has a log entry. */
export function renderDay(date: string, tasks: Task[], agenda: Agenda, entries: Entry[]): string {
  const assigned = agenda[date] || {};
  const done = new Set(entries.filter((e) => e.date === date).map((e) => e.task));
  const ids = tasks.map((t) => t.id).filter((id) => assigned[id]?.length);
  if (ids.length === 0) return `${prettyDate(date)}: nothing scheduled. Rest day.`;

  const lines = ids.map((id) => {
    const titles = assigned[id].map((i) => i.title).join("; ");
    return `${done.has(id) ? "✅" : "⬜"} ${labelOf(tasks, id)}: ${titles}`;
  });
  const count = ids.filter((id) => done.has(id)).length;
  return [`${prettyDate(date)} · ${count}/${ids.length} done`, ...lines].join("\n");
}

export function dayProgress(date: string, agenda: Agenda, entries: Entry[]): string {
  const assigned = Object.keys(agenda[date] || {});
  if (assigned.length === 0) return "";
  const done = new Set(entries.filter((e) => e.date === date).map((e) => e.task));
  const count = assigned.filter((id) => done.has(id)).length;
  return `${prettyDate(date)}: ${count}/${assigned.length} done`;
}
