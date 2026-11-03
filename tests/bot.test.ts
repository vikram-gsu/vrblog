import { test } from "node:test";
import assert from "node:assert/strict";
import {
  appendEntries,
  parseMessage,
  parseMinutes,
  readEntries,
  removeLastEntry,
  renderDay,
  todayIn,
} from "../api/_lib/bot.ts";

const IDS = new Set([
  "applied-ai", "foundations", "robotics-rl",
  "leetcode", "system-design-xu", "ddia", "system-design-lab",
]);
const TODAY = "2026-10-23";

test("minutes in all supported forms", () => {
  assert.equal(parseMinutes("45"), 45);
  assert.equal(parseMinutes("45m"), 45);
  assert.equal(parseMinutes("1h"), 60);
  assert.equal(parseMinutes("1.5h"), 90);
  assert.equal(parseMinutes("1h30"), 90);
  assert.equal(parseMinutes("1h30m"), 90);
  assert.equal(parseMinutes("ch8"), undefined);
});

test("logs a task with time and note", () => {
  assert.deepEqual(parseMessage("ddia 45 ch8 isolation", TODAY, IDS), [
    { kind: "log", entry: { date: TODAY, task: "ddia", minutes: 45, note: "ch8 isolation" } },
  ]);
});

test("time and note are optional; aliases are case-insensitive", () => {
  assert.deepEqual(parseMessage("LC", TODAY, IDS), [
    { kind: "log", entry: { date: TODAY, task: "leetcode" } },
  ]);
  assert.deepEqual(parseMessage("Evals two failure types", TODAY, IDS), [
    { kind: "log", entry: { date: TODAY, task: "applied-ai", note: "two failure types" } },
  ]);
});

test("every track has short names", () => {
  const tasks = (body: string) => parseMessage(body, TODAY, IDS).map((c) => c.kind === "log" && c.entry.task);
  assert.deepEqual(tasks("a 1h\nalgo 1h sec 8\nllm ch 2\nrl unit 1\nsd 90 breakscale\nxu\nddia"), [
    "applied-ai", "foundations", "foundations", "robotics-rl", "system-design-lab", "system-design-xu", "ddia",
  ]);
});

test("date prefixes", () => {
  const [y] = parseMessage("yesterday llm 90", TODAY, IDS);
  assert.deepEqual(y, { kind: "log", entry: { date: "2026-10-22", task: "foundations", minutes: 90 } });
  const [d] = parseMessage("10/20 xu 2h", TODAY, IDS);
  assert.deepEqual(d, { kind: "log", entry: { date: "2026-10-20", task: "system-design-xu", minutes: 120 } });
  const [past] = parseMessage("12/30 xu", "2027-01-02", IDS);
  assert.equal(past.kind === "log" && past.entry.date, "2026-12-30");
});

test("multi-line messages and other commands", () => {
  const cmds = parseMessage("lc 40\nllm 1h ch1\n\ntoday\nundo\nhelp\nblah", TODAY, IDS);
  assert.deepEqual(cmds.map((c) => c.kind), ["log", "log", "today", "undo", "help", "unknown"]);
  assert.deepEqual(parseMessage("?", TODAY, IDS), [{ kind: "today", date: TODAY }]);
  assert.deepEqual(parseMessage("yesterday?", TODAY, IDS), [{ kind: "today", date: "2026-10-22" }]);
});

test("a lone date word is not swallowed as a date", () => {
  assert.deepEqual(parseMessage("today", TODAY, IDS), [{ kind: "today", date: TODAY }]);
});

test("append to an empty log keeps comments and parses back", () => {
  const original = "# One entry per task per session. Append new entries at the bottom.\n#   date: YYYY-MM-DD\nentries: []\n";
  const out = appendEntries(original, [
    { date: TODAY, task: "ddia", minutes: 45, note: 'ch8: "quotes" & colons' },
    { date: TODAY, task: "leetcode" },
  ]);
  assert.match(out, /^# One entry per task/);
  assert.deepEqual(readEntries(out), [
    { date: TODAY, task: "ddia", minutes: 45, note: 'ch8: "quotes" & colons' },
    { date: TODAY, task: "leetcode" },
  ]);
  // Each entry stays on one line, like the hand-written examples.
  assert.equal(out.split("\n").filter((l) => l.trim().startsWith("- {")).length, 2);
});

test("append works on block-style logs as Decap CMS writes them", () => {
  const decap = "entries:\n  - date: 2026-10-22\n    task: ddia\n    minutes: 30\n";
  const out = appendEntries(decap, [{ date: TODAY, task: "leetcode", minutes: 60 }]);
  assert.deepEqual(readEntries(out).map((e) => e.task), ["ddia", "leetcode"]);
  assert.equal(readEntries(out)[0].date, "2026-10-22");
});

test("undo removes the last entry, and empties back to []", () => {
  const one = appendEntries("entries: []\n", [{ date: TODAY, task: "ddia" }]);
  const two = appendEntries(one, [{ date: TODAY, task: "leetcode", minutes: 20 }]);
  const { yaml, removed } = removeLastEntry(two);
  assert.deepEqual(removed, { date: TODAY, task: "leetcode", minutes: 20 });
  assert.deepEqual(readEntries(yaml), [{ date: TODAY, task: "ddia" }]);
  const empty = removeLastEntry(yaml).yaml;
  assert.deepEqual(readEntries(empty), []);
  assert.equal(removeLastEntry(empty).removed, undefined);
});

const PHASES = {
  phases: [
    {
      id: "p1", label: "Start", tracks: ["applied-ai", "foundations"], exit: "x",
      items: [
        { id: "a1", task: "applied-ai", title: "Log sessions" },
        { id: "b1", task: "foundations", title: "Course 1" },
      ],
    },
    {
      id: "p2", label: "Retrieval", tracks: ["applied-ai", "foundations"], exit: "y",
      items: [
        { id: "a2", task: "applied-ai", title: "RAG 3", after: "b2" },
        { id: "b2", task: "foundations", title: "Course 2" },
      ],
    },
  ],
};
const TRACKS = {
  "applied-ai": PHASES.phases.flatMap((p) => p.items).filter((i) => i.task === "applied-ai"),
  foundations: PHASES.phases.flatMap((p) => p.items).filter((i) => i.task === "foundations"),
  leetcode: [{ id: "lc-1", task: "leetcode", title: "1768" }],
};
const TASKS = [
  { id: "applied-ai", label: "Track A" },
  { id: "foundations", label: "Track B" },
  { id: "leetcode", label: "LeetCode" },
];

test("today shows what was logged and what's next", () => {
  const log = [
    { date: "2026-10-20", task: "applied-ai", done: ["a1"] },
    { date: TODAY, task: "foundations", minutes: 30, done: ["b1"] },
  ];
  assert.equal(
    renderDay(TODAY, TODAY, TASKS, PHASES, TRACKS, log),
    "Fri, Oct 23 · 1 logged\n✅ Track B · 30 min · done: Course 1\n\n" +
      "Next · Retrieval\n• Track A: Course 2 (first, then: RAG 3)\n• Track B: Course 2\nInterview prep\n• LeetCode: 1768"
  );
  assert.equal(renderDay("2026-10-22", TODAY, TASKS, PHASES, TRACKS, log), "Thu, Oct 22: nothing logged.");
});

test("done finishes the next items", () => {
  assert.deepEqual(parseMessage("lc 1h done 2 tricky", TODAY, IDS), [
    { kind: "log", entry: { date: TODAY, task: "leetcode", minutes: 60, note: "tricky" }, doneNext: 2 },
  ]);
  assert.deepEqual(parseMessage("llm done", TODAY, IDS), [
    { kind: "log", entry: { date: TODAY, task: "foundations" }, doneNext: 1 },
  ]);
  // "done" later in the note is just a note.
  assert.deepEqual(parseMessage("llm 50 ch1 done", TODAY, IDS), [
    { kind: "log", entry: { date: TODAY, task: "foundations", minutes: 50, note: "ch1 done" } },
  ]);
});

test("today follows the configured time zone", () => {
  // 02:00 UTC on Oct 24 is still Oct 23 in Atlanta.
  const now = new Date("2026-10-24T02:00:00Z");
  assert.equal(todayIn("America/New_York", now), "2026-10-23");
  assert.equal(todayIn("UTC", now), "2026-10-24");
});
