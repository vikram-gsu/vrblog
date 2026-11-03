import { parse as parseYaml } from "yaml";
import planFile from "/content/tracker/plan.yaml?raw";
import logFile from "/content/tracker/log.yaml?raw";
import phasesFile from "/content/tracker/phases.yaml?raw";
import queueFile from "/content/tracker/queue.yaml?raw";
import { readPhases, readQueue, type Phases, type Tracks } from "./plan";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function weekdayOf(iso: string): Weekday {
  return WEEKDAYS[new Date(`${iso}T00:00:00Z`).getUTCDay()];
}

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
  /** Ids of phases.yaml / queue.yaml items this session finished. */
  done?: string[];
}

export type DayStatus = "done" | "rest";

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

export function getPhases(): Phases {
  return readPhases(parseYaml(phasesFile));
}

export function getQueue(): Tracks {
  return readQueue(parseYaml(queueFile));
}

function levelFor(minutes: number, hasEntry: boolean): TrackerDay["level"] {
  if (!hasEntry) return 0;
  if (minutes === 0) return 2; // logged without a duration
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

/** Builds the per-day cells for one task across the plan window. Nothing counts as missed. */
export function buildTaskDays(
  plan: TrackerPlan,
  task: TrackerTask,
  log: LogEntry[]
): TrackerDay[] {
  return dateRange(plan.start, plan.end).map((date) => {
    const entries = log.filter((e) => e.task === task.id && e.date === date);
    const minutes = entries.reduce((sum, e) => sum + (Number(e.minutes) || 0), 0);
    return {
      date,
      level: levelFor(minutes, entries.length > 0),
      status: entries.length ? "done" : "rest",
      entries,
    };
  });
}

/** The combined grid: shade = hours logged that day (or tasks touched, without durations). */
export function buildOverallDays(
  plan: TrackerPlan,
  log: LogEntry[]
): TrackerDay[] {
  const known = new Set(plan.groups.flatMap((g) => g.tasks.map((t) => t.id)));
  return dateRange(plan.start, plan.end).map((date) => {
    const entries = log.filter((e) => known.has(e.task) && e.date === date);
    const minutes = entries.reduce((sum, e) => sum + (Number(e.minutes) || 0), 0);
    const distinct = new Set(entries.map((e) => e.task)).size;
    const level = (minutes ? levelFor(minutes / 3, true) : Math.min(distinct, 4)) as TrackerDay["level"];
    return {
      date,
      level,
      status: entries.length ? "done" : "rest",
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
