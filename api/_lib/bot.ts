// Pure logic for the WhatsApp tracker bot: parse messages, edit log.yaml, write replies.
// No I/O here, so it can be tested with `npm test`.
import { parse as parseYaml, parseDocument, YAMLSeq } from "yaml";
import { currentPhase, doneIds, nextFor, type Phases, type Tracks } from "../../src/lib/plan.js";

export interface Task {
  id: string;
  label: string;
}

export interface Entry {
  date: string;
  task: string;
  minutes?: number;
  note?: string;
  /** Ids of phases.yaml / queue.yaml items finished. */
  done?: string[];
}

export type Command =
  // doneNext: finish the task's next N items (resolved against the log when it's written).
  | { kind: "log"; entry: Entry; doneNext?: number }
  | { kind: "today"; date: string }
  | { kind: "undo" }
  | { kind: "help" }
  | { kind: "unknown"; text: string };

// Short names you can type instead of a task id.
const ALIASES: Record<string, string> = {
  a: "applied-ai",
  ai: "applied-ai",
  evals: "applied-ai",
  rag: "applied-ai",
  timer: "applied-ai",
  b: "foundations",
  found: "foundations",
  llm: "foundations",
  raschka: "foundations",
  karpathy: "foundations",
  algo: "foundations",
  algos: "foundations",
  lecture: "foundations",
  lectures: "foundations",
  c: "robotics-rl",
  rl: "robotics-rl",
  robot: "robotics-rl",
  robotics: "robotics-rl",
  lc: "leetcode",
  leet: "leetcode",
  leetcode: "leetcode",
  xu: "system-design-xu",
  sdi: "system-design-xu",
  ddia: "ddia",
  kleppmann: "ddia",
  sd: "system-design-lab",
  lab: "system-design-lab",
  sdlab: "system-design-lab",
};

export const HELP = [
  "Log a session: <task> [time] [note]",
  "  ddia 45 ch8 isolation levels",
  "  lc 1h two problems",
  "  yesterday llm 90 ch2",
  "  10/22 xu 2h",
  "Finish the next item: ai 2h done (lc 1h done 2 for two)",
  "",
  "Tasks: ai (track A), b (track B; llm, algo work too), rl (track C), lc, xu, ddia, sd",
  "Time: 45, 45m, 1h, 1h30, 1.5h (optional)",
  "",
  "Other: today (or ?) for what's next, yesterday?, undo, help",
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
  let doneNext: number | undefined;
  if (tokens[0]?.toLowerCase() === "done") {
    tokens.shift();
    const n = /^\d{1,2}$/.test(tokens[0] ?? "") ? Number(tokens.shift()) : 1;
    if (n > 0) doneNext = n;
  }
  const note = tokens.join(" ").trim();
  if (note) entry.note = note;
  return doneNext ? { kind: "log", entry, doneNext } : { kind: "log", entry };
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

export function describeEntry(entry: Entry, tasks: Task[], titles: Map<string, string> = new Map()): string {
  return [
    labelOf(tasks, entry.task),
    entry.minutes ? `${entry.minutes} min` : null,
    entry.done?.length ? `done: ${entry.done.map((id) => titles.get(id) ?? id).join("; ")}` : null,
    entry.note ? `"${entry.note}"` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function itemTitles(tracks: Tracks): Map<string, string> {
  return new Map(Object.values(tracks).flat().map((i) => [i.id, i.title]));
}

/** The task's next item, or why there isn't one. */
export function nextLine(task: string, tasks: Task[], tracks: Tracks, entries: Entry[]): string {
  const { item, waitingOn } = nextFor(tracks, task, doneIds(entries));
  const label = labelOf(tasks, task);
  if (!item) return `${label}: all done`;
  return `${label}: ${waitingOn ? `${waitingOn.title} (first, then: ${item.title})` : item.title}`;
}

/**
 * "today": what was logged that day, then (for today) the next item in each of the current
 * phase's tracks and in each prep track. No dates in the plan, so other days only show logs.
 */
export function renderDay(
  date: string,
  today: string,
  tasks: Task[],
  phases: Phases,
  tracks: Tracks,
  entries: Entry[]
): string {
  const titles = itemTitles(tracks);
  const logged = entries.filter((e) => e.date === date).map((e) => `✅ ${describeEntry(e, tasks, titles)}`);
  if (date !== today) return [`${prettyDate(date)}: ${logged.length ? "" : "nothing logged."}`.trim(), ...logged].join("\n");

  const phase = currentPhase(phases, doneIds(entries));
  const learning = new Set(phases.phases.flatMap((p) => p.tracks));
  const prep = tasks.map((t) => t.id).filter((id) => !learning.has(id) && tracks[id]);
  return [
    `${prettyDate(date)}${logged.length ? ` · ${logged.length} logged` : ""}`,
    ...logged,
    "",
    phase ? `Next · ${phase.label}` : "Every phase is done.",
    ...(phase?.tracks ?? []).map((t) => `• ${nextLine(t, tasks, tracks, entries)}`),
    "Interview prep",
    ...prep.map((t) => `• ${nextLine(t, tasks, tracks, entries)}`),
  ].join("\n");
}
