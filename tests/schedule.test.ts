import { test } from "node:test";
import assert from "node:assert/strict";
import { blocksFor, nextItems, project, readQueue, readSchedule } from "../src/lib/schedule.ts";

const queue = readQueue({
  tracks: {
    read: { hours: 2, items: [{ id: "r1", title: "R1", hours: 3 }, { id: "r2", title: "R2" }] },
    lc: { hours: 0.5, items: [{ id: "a", title: "A" }, { id: "b", title: "B" }, { id: "c", title: "C" }] },
    idle: { items: [{ id: "x", title: "X" }] },
  },
});
const schedule = readSchedule({
  templates: {
    full: [
      { time: "10–11", hours: 1, label: "LC", tasks: ["lc"] },
      { time: "1–3", hours: 2, label: "Reading", tasks: ["read"] },
    ],
    light: [{ time: "9–10", hours: 1, label: "LC", tasks: ["lc", "read"] }],
    off: [],
  },
  week: { mon: "full", tue: "full", wed: "full", thu: "full", fri: "full", sat: "light", sun: "light" },
  days: { "2026-11-04": { template: "off", note: "Out" } },
});
const titles = (day: { blocks: { items: { item: { id: string } }[] }[] }) =>
  day.blocks.map((b) => b.items.map((i) => i.item.id));

test("blocks fill by hours; long items run into the next block", () => {
  const { days } = project(queue, schedule, [], "2026-11-02", "2026-11-03");
  assert.deepEqual(titles(days[0]), [["a", "b"], ["r1"]]);
  assert.equal(days[0].blocks[1].items[0].continues, true);
  assert.deepEqual(titles(days[1]), [["c"], ["r1", "r2"]]);
  assert.equal(days[1].blocks[1].items[0].continued, true);
  assert.equal(days[0].hours, 3);
});

test("unfinished work stays next; finished work drops out; days off pass by", () => {
  const log = [
    { date: "2026-11-01", task: "lc", done: ["a"] },
    { date: "2026-11-02", task: "lc", done: ["c"] }, // done on the day, out of order
  ];
  const { days, finish } = project(queue, schedule, log, "2026-11-02", "2026-11-05");
  assert.deepEqual(titles(days[0]), [["b", "c"], ["r1"]]);
  assert.deepEqual(days[0].blocks[0].items.map((i) => i.done), [false, true]);
  // Tomorrow assumes b got done today too: lc is finished, so its block sits empty.
  assert.deepEqual(titles(days[1]), [[], ["r1", "r2"]]);
  assert.equal(days[2].note, "Out");
  assert.deepEqual(days[2].blocks, []);
  assert.equal(finish.lc, "2026-11-02");
  assert.equal(finish.read, "2026-11-05"); // R2 runs over, past the day off
  assert.equal(finish.idle, undefined);
});

test("a block falls through to its next track once the first is finished", () => {
  const log = [{ date: "2026-11-01", task: "lc", done: ["a", "b", "c"] }];
  const { days } = project(queue, schedule, log, "2026-11-07", "2026-11-07");
  assert.equal(days[0].blocks[0].task, "read");
});

test("date overrides and the next items for done", () => {
  assert.equal(blocksFor(schedule, "2026-11-04").blocks.length, 0);
  assert.equal(blocksFor(schedule, "2026-11-07").blocks[0].label, "LC");
  assert.deepEqual(nextItems(queue, [{ date: "2026-11-01", task: "lc", done: ["a"] }], "lc", 2).map((i) => i.id), ["b", "c"]);
});
