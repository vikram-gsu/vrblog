// Turns the time blocks (schedule.yaml) and each track's ordered work (queue.yaml) into a
// day-by-day plan, given what the log says is finished. Pure, with no imports, so the site
// and the WhatsApp bot (api/) share it.

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface QueueItem {
  id: string;
  title: string;
  link?: string;
  hours: number;
}

/** task id -> its items, in order */
export type Queue = Record<string, QueueItem[]>;

export interface Block {
  time: string;
  hours: number;
  label: string;
  /** The block works on the first of these that still has items left. */
  tasks: string[];
}

export interface Schedule {
  templates: Record<string, Block[]>;
  week: Partial<Record<Weekday, string>>;
  days: Record<string, { template?: string; note?: string }>;
}

export interface Logged {
  date: string;
  task: string;
  done?: string[];
}

export interface PlannedItem {
  item: QueueItem;
  done: boolean;
  /** Started in an earlier block. */
  continued: boolean;
  /** Runs past the end of this block. */
  continues: boolean;
}

export interface PlannedBlock extends Block {
  task?: string;
  items: PlannedItem[];
}

export interface PlannedDay {
  date: string;
  note?: string;
  blocks: PlannedBlock[];
  hours: number;
}

export interface Projection {
  days: PlannedDay[];
  /** task id -> the day its last item is planned, if it fits in the window */
  finish: Record<string, string | undefined>;
}

const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const EPS = 1e-9;

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(iso: string): Weekday {
  return WEEKDAYS[new Date(`${iso}T00:00:00Z`).getUTCDay()];
}

function str(value: unknown): string {
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "");
}

/** Parsed queue.yaml -> Queue, filling in each item's hours from its track's default. */
export function readQueue(data: unknown): Queue {
  const tracks = ((data as { tracks?: Record<string, { hours?: number; items?: Partial<QueueItem>[] }> })
    ?.tracks) ?? {};
  const queue: Queue = {};
  for (const [task, track] of Object.entries(tracks)) {
    queue[task] = (track.items ?? []).map((i) => ({
      id: str(i.id),
      title: str(i.title),
      ...(i.link ? { link: i.link } : {}),
      hours: Number(i.hours ?? track.hours ?? 1),
    }));
  }
  return queue;
}

/** Parsed schedule.yaml -> Schedule. */
export function readSchedule(data: unknown): Schedule {
  const s = (data ?? {}) as Partial<Schedule>;
  const days: Schedule["days"] = {};
  for (const [date, day] of Object.entries(s.days ?? {})) days[str(date).slice(0, 10)] = day ?? {};
  return { templates: s.templates ?? {}, week: s.week ?? {}, days };
}

export function blocksFor(schedule: Schedule, date: string): { blocks: Block[]; note?: string } {
  const override = schedule.days[date];
  const name = override?.template ?? schedule.week[weekdayOf(date)];
  return { blocks: (name && schedule.templates[name]) || [], note: override?.note };
}

function doneIds(log: Logged[], keep: (date: string) => boolean): Set<string> {
  return new Set(log.filter((e) => keep(e.date)).flatMap((e) => e.done ?? []).map(String));
}

/**
 * Plans each day from `from` to `to`. Work starts from what was unfinished at the start of
 * `from`; items finished on `from` show as done there, and every later day assumes the days
 * before it went as planned.
 */
export function project(queue: Queue, schedule: Schedule, log: Logged[], from: string, to: string): Projection {
  const before = doneIds(log, (d) => d < from);
  const onFrom = doneIds(log, (d) => d === from);
  // Per task: the unfinished items, with the hours still left on the first one.
  const left: Record<string, { item: QueueItem; hours: number }[]> = {};
  for (const [task, items] of Object.entries(queue)) {
    left[task] = items.filter((i) => !before.has(i.id)).map((item) => ({ item, hours: item.hours }));
  }

  const days: PlannedDay[] = [];
  const finish: Projection["finish"] = {};
  for (let date = from; date <= to; date = addDays(date, 1)) {
    const { blocks, note } = blocksFor(schedule, date);
    const planned: PlannedBlock[] = blocks.map((block) => {
      const task = block.tasks.find((t) => left[t]?.length);
      const items: PlannedItem[] = [];
      let room = block.hours;
      const q = task ? left[task] : [];
      while (q.length && room > EPS) {
        const head = q[0];
        const used = Math.min(head.hours, room);
        const continued = head.hours < head.item.hours - EPS;
        head.hours -= used;
        room -= used;
        const finished = head.hours <= EPS;
        items.push({ item: head.item, done: date === from && onFrom.has(head.item.id), continued, continues: !finished });
        if (finished) {
          q.shift();
          if (!q.length) finish[task] = date;
        }
      }
      return { ...block, task, items };
    });
    if (date === from) {
      // Extra items finished that day aren't planned again.
      for (const [task, q] of Object.entries(left)) {
        const had = q.length;
        left[task] = q.filter((x) => !onFrom.has(x.item.id));
        if (had && !left[task].length) finish[task] ??= date;
      }
    }
    days.push({ date, note, blocks: planned, hours: blocks.reduce((sum, b) => sum + b.hours, 0) });
  }
  for (const task of Object.keys(queue)) {
    if (left[task].length) finish[task] = undefined;
  }
  return { days, finish };
}

/** The next `n` unfinished items of a task, for "done" messages that don't name items. */
export function nextItems(queue: Queue, log: Logged[], task: string, n: number): QueueItem[] {
  const done = doneIds(log, () => true);
  return (queue[task] ?? []).filter((i) => !done.has(i.id)).slice(0, n);
}
