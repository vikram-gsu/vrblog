// The learning plan (phases.yaml) and interview prep (queue.yaml) as ordered lists of items.
// No dates: each track's next item is its first unfinished one. Pure, with no imports, so the
// site and the WhatsApp bot (api/) share it.

export interface PlanItem {
  id: string;
  task: string;
  title: string;
  link?: string;
  optional?: boolean;
  /** An item that must be done before this one. */
  after?: string;
}

export interface Phase {
  id: string;
  label: string;
  tracks: string[];
  exit: string;
  background?: string;
  items: PlanItem[];
}

export interface Phases {
  phases: Phase[];
  cut?: string;
}

/** task id -> its items, in order */
export type Tracks = Record<string, PlanItem[]>;

export interface Logged {
  date: string;
  task: string;
  done?: string[];
}

export interface Next {
  item?: PlanItem;
  /** Set when `item` has to wait for an unfinished item. */
  waitingOn?: PlanItem;
}

const str = (v: unknown) => String(v ?? "");

function readItem(i: Partial<PlanItem>, task?: string): PlanItem {
  return {
    id: str(i.id),
    task: str(i.task ?? task),
    title: str(i.title),
    ...(i.link ? { link: i.link } : {}),
    ...(i.optional ? { optional: true } : {}),
    ...(i.after ? { after: str(i.after) } : {}),
  };
}

/** Parsed phases.yaml -> Phases. */
export function readPhases(data: unknown): Phases {
  const d = (data ?? {}) as { phases?: Partial<Phase>[]; cut?: string };
  return {
    phases: (d.phases ?? []).map((p) => ({
      id: str(p.id),
      label: str(p.label),
      tracks: (p.tracks ?? []).map(str),
      exit: str(p.exit),
      ...(p.background ? { background: p.background } : {}),
      items: (p.items ?? []).map((i) => readItem(i)),
    })),
    ...(d.cut ? { cut: d.cut } : {}),
  };
}

/** Parsed queue.yaml -> each prep track's items. */
export function readQueue(data: unknown): Tracks {
  const tracks = ((data as { tracks?: Record<string, { items?: Partial<PlanItem>[] }> })?.tracks) ?? {};
  const out: Tracks = {};
  for (const [task, t] of Object.entries(tracks)) out[task] = (t.items ?? []).map((i) => readItem(i, task));
  return out;
}

/** Every track's items in order: the phases' items grouped by track, then the prep tracks. */
export function allTracks(phases: Phases, queue: Tracks): Tracks {
  const out: Tracks = {};
  for (const item of phases.phases.flatMap((p) => p.items)) (out[item.task] ??= []).push(item);
  for (const [task, items] of Object.entries(queue)) (out[task] ??= []).push(...items);
  return out;
}

export function doneIds(log: Logged[]): Set<string> {
  return new Set(log.flatMap((e) => e.done ?? []).map(str));
}

/** The first phase with unfinished required items; undefined once every phase is done. */
export function currentPhase(phases: Phases, done: Set<string>): Phase | undefined {
  return phases.phases.find((p) => p.items.some((i) => !i.optional && !done.has(i.id)));
}

export function nextFor(tracks: Tracks, task: string, done: Set<string>): Next {
  const item = (tracks[task] ?? []).find((i) => !done.has(i.id));
  if (!item) return {};
  const all = Object.values(tracks).flat();
  const blocker = item.after && !done.has(item.after) ? all.find((i) => i.id === item.after) : undefined;
  return blocker ? { item, waitingOn: blocker } : { item };
}

/** The next `n` unfinished items of a task, for "done" messages that don't name items. */
export function nextItems(tracks: Tracks, log: Logged[], task: string, n: number): PlanItem[] {
  const done = doneIds(log);
  return (tracks[task] ?? []).filter((i) => !done.has(i.id)).slice(0, n);
}
