import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  "llm-from-scratch", "ddia", "system-design-xu", "blogs-papers",
  "leetcode", "agents", "agent-harnesses", "experiments",
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
  assert.deepEqual(parseMessage("harness two tools wired", TODAY, IDS), [
    { kind: "log", entry: { date: TODAY, task: "agent-harnesses", note: "two tools wired" } },
  ]);
});

test("date prefixes", () => {
  const [y] = parseMessage("yesterday llm 90", TODAY, IDS);
  assert.deepEqual(y, { kind: "log", entry: { date: "2026-10-22", task: "llm-from-scratch", minutes: 90 } });
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

test("append to the real empty log keeps comments and parses back", () => {
  const original = readFileSync(new URL("../content/tracker/log.yaml", import.meta.url), "utf8");
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
  const out = appendEntries(decap, [{ date: TODAY, task: "agents", minutes: 60 }]);
  assert.deepEqual(readEntries(out).map((e) => e.task), ["ddia", "agents"]);
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

test("renders the day's checklist", () => {
  const tasks = [
    { id: "llm-from-scratch", label: "LLM" },
    { id: "leetcode", label: "LeetCode" },
  ];
  const agenda = { [TODAY]: { "llm-from-scratch": [{ title: "Ch 1" }], leetcode: [{ title: "1768" }, { title: "1071" }] } };
  const text = renderDay(TODAY, tasks, agenda, [{ date: TODAY, task: "leetcode" }]);
  assert.equal(text, "Fri, Oct 23 · 1/2 done\n⬜ LLM: Ch 1\n✅ LeetCode: 1768; 1071");
  assert.match(renderDay("2026-10-24", tasks, agenda, []), /Rest day/);
});

test("today follows the configured time zone", () => {
  // 02:00 UTC on Oct 24 is still Oct 23 in Atlanta.
  const now = new Date("2026-10-24T02:00:00Z");
  assert.equal(todayIn("America/New_York", now), "2026-10-23");
  assert.equal(todayIn("UTC", now), "2026-10-24");
});
