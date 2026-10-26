import { parse as parseYaml } from "yaml";
import planFile from "/content/tracker/plan.yaml?raw";
import logFile from "/content/tracker/log.yaml?raw";
import agendaFile from "/content/tracker/agenda.yaml?raw";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface TrackerTask {
  id: string;
  label: string;
  detail?: string;
  link?: string;
}

export interface TrackerGroup {
  id: string;
  label: string;
  tasks: TrackerTask[];
}

export interface TrackerPlan {
  title: string;
  start: string;
  end: string;
  groups: TrackerGroup[];
}

export interface LogEntry {
  date: string;
  task: string;
  minutes?: number;
  note?: string;
}

export interface AgendaItem {
  title: string;
  link?: string;
}

/** date -> task id -> what to do that day */
export type Agenda = Record<string, Record<string, AgendaItem[]>>;

export type DayStatus = "done" | "missed" | "upcoming" | "rest";

export interface TrackerDay {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  status: DayStatus;
  scheduled: boolean;
  entries: LogEntry[];
}

export interface TrackerStats {
  daysDone: number;
  scheduledSoFar: number;
  scheduledDone: number;
  currentStreak: number;
  longestStreak: number;
  minutes: number;
}

const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Dates are handled as YYYY-MM-DD strings and stepped in UTC so DST never skips a day.
function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
}

export function weekdayOf(iso: string): Weekday {
  return WEEKDAYS[toDate(iso).getUTCDay()];
}

export function todayIso(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function dateRange(start: string, end: string): string[] {
  const days: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date) return toIso(value);
  return String(value ?? "").slice(0, 10);
}

export function getPlan(): TrackerPlan {
  const data = (parseYaml(planFile) || {}) as Partial<TrackerPlan>;
  return {
    title: data.title || "Currently working on",
    start: normalizeDate(data.start),
    end: normalizeDate(data.end),
    groups: (data.groups || []).map((g) => ({
      ...g,
      tasks: g.tasks || [],
    })),
  };
}

export function getLog(): LogEntry[] {
  const data = (parseYaml(logFile) || {}) as { entries?: LogEntry[] };
  return (data.entries || [])
    .filter((e) => e && e.date && e.task)
    .map((e) => ({ ...e, date: normalizeDate(e.date) }));
}

export function getAgenda(): Agenda {
  const data = (parseYaml(agendaFile) || {}) as { days?: Agenda };
  return data.days || {};
}

function levelFor(minutes: number, hasEntry: boolean): TrackerDay["level"] {
  if (!hasEntry) return 0;
  if (minutes === 0) return 2; // logged without a duration
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

function statusFor(
  hasEntry: boolean,
  scheduled: boolean,
  date: string,
  today: string
): DayStatus {
  if (hasEntry) return "done";
  if (!scheduled) return "rest";
  return date < today ? "missed" : "upcoming";
}

/** A task is scheduled on a day exactly when the agenda gives it something to do. */
export function isScheduled(agenda: Agenda, taskId: string, date: string): boolean {
  return (agenda[date]?.[taskId]?.length ?? 0) > 0;
}

/** Builds the per-day cells for one task across the plan window. */
export function buildTaskDays(
  plan: TrackerPlan,
  agenda: Agenda,
  task: TrackerTask,
  log: LogEntry[],
  today: string
): TrackerDay[] {
  const byDate = new Map<string, LogEntry[]>();
  for (const e of log) {
    if (e.task !== task.id) continue;
    byDate.set(e.date, [...(byDate.get(e.date) || []), e]);
  }

  return dateRange(plan.start, plan.end).map((date) => {
    const entries = byDate.get(date) || [];
    const minutes = entries.reduce((sum, e) => sum + (Number(e.minutes) || 0), 0);
    const scheduled = isScheduled(agenda, task.id, date);
    return {
      date,
      level: levelFor(minutes, entries.length > 0),
      status: statusFor(entries.length > 0, scheduled, date, today),
      scheduled,
      entries,
    };
  });
}

/** Builds the combined "did I show up at all" cells: shade = number of tasks done that day. */
export function buildOverallDays(
  plan: TrackerPlan,
  agenda: Agenda,
  log: LogEntry[],
  today: string
): TrackerDay[] {
  const tasks = plan.groups.flatMap((g) => g.tasks);
  const known = new Set(tasks.map((t) => t.id));
  const byDate = new Map<string, LogEntry[]>();
  for (const e of log) {
    if (!known.has(e.task)) continue;
    byDate.set(e.date, [...(byDate.get(e.date) || []), e]);
  }

  return dateRange(plan.start, plan.end).map((date) => {
    const entries = byDate.get(date) || [];
    const distinct = new Set(entries.map((e) => e.task)).size;
    const scheduled = tasks.some((t) => isScheduled(agenda, t.id, date));
    const level = Math.min(distinct, 4) as TrackerDay["level"];
    return {
      date,
      level,
      status: statusFor(distinct > 0, scheduled, date, today),
      scheduled,
      entries,
    };
  });
}

/**
 * Streaks count consecutive scheduled days that were done. Unscheduled days
 * neither break nor extend a streak, and an unfinished today doesn't break it yet.
 */
export function computeStats(days: TrackerDay[], today: string): TrackerStats {
  let run = 0;
  let longest = 0;
  let scheduledSoFar = 0;
  let scheduledDone = 0;
  let minutes = 0;
  let daysDone = 0;

  for (const day of days) {
    if (day.date > today) break;
    minutes += day.entries.reduce((sum, e) => sum + (Number(e.minutes) || 0), 0);
    if (day.status === "done") daysDone++;
    if (!day.scheduled) continue;
    if (day.status === "done") {
      scheduledSoFar++;
      scheduledDone++;
      run++;
      longest = Math.max(longest, run);
    } else if (day.date < today) {
      scheduledSoFar++;
      run = 0;
    }
  }

  return {
    daysDone,
    scheduledSoFar,
    scheduledDone,
    currentStreak: run,
    longestStreak: longest,
    minutes,
  };
}
