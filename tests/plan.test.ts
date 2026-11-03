import { test } from "node:test";
import assert from "node:assert/strict";
import { allTracks, currentPhase, nextFor, nextItems, readPhases, readQueue } from "../src/lib/plan.ts";

const phases = readPhases({
  phases: [
    {
      id: "p1", label: "One", tracks: ["a", "b"], exit: "x",
      items: [
        { id: "a1", task: "a", title: "A1" },
        { id: "a-opt", task: "a", title: "Optional", optional: true },
        { id: "b1", task: "b", title: "B1" },
      ],
    },
    {
      id: "p2", label: "Two", tracks: ["a", "b"], exit: "y",
      items: [
        { id: "a2", task: "a", title: "A2", after: "b2" },
        { id: "b2", task: "b", title: "B2" },
      ],
    },
  ],
  cut: "Later stuff",
});
const tracks = allTracks(phases, readQueue({ tracks: { lc: { items: [{ id: "lc-1", title: "1" }, { id: "lc-2", title: "2" }] } } }));

test("tracks list phase items in phase order, then prep", () => {
  assert.deepEqual(tracks.a.map((i) => i.id), ["a1", "a-opt", "a2"]);
  assert.deepEqual(tracks.lc.map((i) => i.task), ["lc", "lc"]);
  assert.equal(phases.cut, "Later stuff");
});

test("the current phase skips optional items", () => {
  assert.equal(currentPhase(phases, new Set())?.id, "p1");
  assert.equal(currentPhase(phases, new Set(["a1", "b1"]))?.id, "p2");
  assert.equal(currentPhase(phases, new Set(["a1", "b1", "a2", "b2"])), undefined);
});

test("next items wait on their `after`", () => {
  const done = new Set(["a1", "a-opt", "b1"]);
  assert.deepEqual(nextFor(tracks, "a", done), { item: tracks.a[2], waitingOn: tracks.b[1] });
  assert.deepEqual(nextFor(tracks, "a", new Set([...done, "b2"])), { item: tracks.a[2] });
  assert.deepEqual(nextFor(tracks, "lc", new Set(["lc-1", "lc-2"])), {});
});

test("done resolves to the next unfinished items", () => {
  const log = [{ date: "2026-11-01", task: "lc", done: ["lc-1"] }];
  assert.deepEqual(nextItems(tracks, log, "lc", 3).map((i) => i.id), ["lc-2"]);
});
