import { parse as parseYaml } from "yaml";
import planFile from "/content/tracker/plan.yaml?raw";
import logFile from "/content/tracker/log.yaml?raw";
import queueFile from "/content/tracker/queue.yaml?raw";
import scheduleFile from "/content/tracker/schedule.yaml?raw";
import { readQueue, readSchedule, type Projection, type Queue, type Schedule, type Weekday } from "./schedule";

export type { Weekday };
export { weekdayOf } from "./schedule";

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
  /** Ids of queue.yaml items this session finished. */
  done?: string[];
}

export type DayStatus = "done" | "upcoming" | "rest";

export interface TrackerDay {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  status: DayStatus;
  entries: LogEntry[];
}

export interface TrackerStats {
  activeDays: number;
  minutes: number;
}

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

export function getQueue(): Queue {
  return readQueue(parseYaml(queueFile));
}

export function getSchedule(): Schedule {
  return readSchedule(parseYaml(scheduleFile));
}

function levelFor(minutes: number, hasEntry: boolean): TrackerDay["level"] {
  if (!hasEntry) return 0;
  if (minutes === 0) return 2; // logged without a duration
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

/** Days from today on that the projection gives this task (or any task) time. */
function plannedDays(projection: Projection, taskId?: string): Set<string> {
  return new Set(
    projection.days
      .filter((d) => d.blocks.some((b) => b.items.length && (!taskId || b.task === taskId)))
      .map((d) => d.date)
  );
}

function statusFor(hasEntry: boolean, planned: boolean, date: string, today: string): DayStatus {
  if (hasEntry) return "done";
  return planned && date >= today ? "upcoming" : "rest";
}

/** Builds the per-day cells for one task across the plan window. Nothing counts as missed. */
export function buildTaskDays(
  plan: TrackerPlan,
  projection: Projection,
  task: TrackerTask,
  log: LogEntry[],
  today: string
): TrackerDay[] {
  const planned = plannedDays(projection, task.id);
  return dateRange(plan.start, plan.end).map((date) => {
    const entries = log.filter((e) => e.task === task.id && e.date === date);
    const minutes = entries.reduce((sum, e) => sum + (Number(e.minutes) || 0), 0);
    return {
      date,
      level: levelFor(minutes, entries.length > 0),
      status: statusFor(entries.length > 0, planned.has(date), date, today),
      entries,
    };
  });
}

/** The combined grid: shade = hours logged that day (or tasks touched, without durations). */
export function buildOverallDays(
  plan: TrackerPlan,
  projection: Projection,
  log: LogEntry[],
  today: string
): TrackerDay[] {
  const known = new Set(plan.groups.flatMap((g) => g.tasks.map((t) => t.id)));
  const planned = plannedDays(projection);
  return dateRange(plan.start, plan.end).map((date) => {
    const entries = log.filter((e) => known.has(e.task) && e.date === date);
    const minutes = entries.reduce((sum, e) => sum + (Number(e.minutes) || 0), 0);
    const distinct = new Set(entries.map((e) => e.task)).size;
    const level = (minutes ? levelFor(minutes / 3, true) : Math.min(distinct, 4)) as TrackerDay["level"];
    return {
      date,
      level,
      status: statusFor(entries.length > 0, planned.has(date), date, today),
      entries,
    };
  });
}

export function computeStats(days: TrackerDay[], today: string): TrackerStats {
  const past = days.filter((d) => d.date <= today);
  return {
    activeDays: past.filter((d) => d.status === "done").length,
    minutes: past.reduce((sum, d) => sum + d.entries.reduce((m, e) => m + (Number(e.minutes) || 0), 0), 0),
  };
}
