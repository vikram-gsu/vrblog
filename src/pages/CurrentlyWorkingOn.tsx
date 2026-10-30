import { useMemo } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import Header from "@/components/layout/Header";
import Heatmap, { cellClass } from "@/components/tracker/Heatmap";
import TodayPanel from "@/components/tracker/TodayPanel";
import { cn } from "@/lib/utils";
import {
  addDays,
  buildOverallDays,
  buildTaskDays,
  computeStats,
  getLog,
  getPlan,
  getQueue,
  getSchedule,
  todayIso,
  type LogEntry,
  type TrackerStats,
  type TrackerTask,
} from "@/lib/tracker";
import { project, type Projection, type Queue, type QueueItem } from "@/lib/schedule";

function hoursText(minutes: number) {
  return minutes ? (minutes / 60).toFixed(1) : 0;
}

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <div className="text-xl font-bold font-heading leading-none">{value}</div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
      {label}
    </div>
  </div>
);

interface Progress {
  done: number;
  total: number;
  next?: QueueItem;
  /** Hours of blocks this task gets over the next 7 days. */
  weekHours: number;
  finish?: string;
}

function progressFor(task: string, queue: Queue, log: LogEntry[], projection: Projection, today: string): Progress {
  const items = queue[task] ?? [];
  const doneIds = new Set(log.flatMap((e) => e.done ?? []));
  const weekEnd = addDays(today, 6);
  const weekHours = projection.days
    .filter((d) => d.date <= weekEnd)
    .flatMap((d) => d.blocks)
    .filter((b) => b.task === task && b.items.length)
    .reduce((sum, b) => sum + b.hours, 0);
  return {
    done: items.filter((i) => doneIds.has(i.id)).length,
    total: items.length,
    next: items.find((i) => !doneIds.has(i.id)),
    weekHours,
    finish: projection.finish[task],
  };
}

function finishText(p: Progress) {
  if (p.total && p.done === p.total) return "Done";
  if (p.finish) return format(parseISO(p.finish), "MMM d");
  return p.weekHours ? "Later" : "—";
}

const TaskTracker = ({
  task,
  days,
  stats,
  progress,
}: {
  task: TrackerTask;
  days: ReturnType<typeof buildTaskDays>;
  stats: TrackerStats;
  progress: Progress;
}) => (
  <div className="bg-card border border-border rounded-lg p-6">
    <div className="mb-5">
      <h3 className="text-xl font-heading">
        {task.link ? (
          <a href={task.link} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
            {task.label}
          </a>
        ) : (
          task.label
        )}
      </h3>
      {task.detail && <p className="text-sm text-muted-foreground mt-1">{task.detail}</p>}
      <p className="text-sm mt-3">
        <span className="text-muted-foreground">
          {progress.next ? (progress.weekHours ? "Next: " : "Paused · next: ") : ""}
        </span>
        {progress.next?.title ?? (progress.total ? "All done" : "Nothing queued")}
      </p>
    </div>
    <Heatmap days={days} size="sm" />
    <div className="grid grid-cols-4 gap-4 mt-5">
      <Stat label="Done" value={progress.total ? `${progress.done}/${progress.total}` : "—"} />
      <Stat label="Hours" value={hoursText(stats.minutes)} />
      <Stat label="Next 7 days" value={`${Number(progress.weekHours.toFixed(1))} h`} />
      <Stat label="Est. finish" value={finishText(progress)} />
    </div>
  </div>
);

const Legend = () => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
    <span className="flex items-center gap-1.5">
      Less
      {[1, 2, 3, 4].map((level) => (
        <span
          key={level}
          className={cn("w-3 h-3 rounded-[3px]", cellClass({ status: "done", level: level as 1 }))}
        />
      ))}
      More
    </span>
    <span className="flex items-center gap-1.5">
      <span className={cn("w-3 h-3 rounded-[3px]", cellClass({ status: "upcoming", level: 0 }))} />
      Planned
    </span>
    <span className="flex items-center gap-1.5">
      <span className={cn("w-3 h-3 rounded-[3px]", cellClass({ status: "rest", level: 0 }))} />
      Nothing logged
    </span>
  </div>
);

const CurrentlyWorkingOn = () => {
  const today = todayIso();
  const { plan, queue, log, projection, overall, overallStats, itemsDone, groups } = useMemo(() => {
    const plan = getPlan();
    const queue = getQueue();
    const log = getLog();
    // Far enough past the plan's end to estimate when long tracks finish.
    const projection = project(queue, getSchedule(), log, today, addDays(plan.end, 180));
    const overall = buildOverallDays(plan, projection, log, today);
    const known = new Set(Object.values(queue).flat().map((i) => i.id));
    return {
      plan,
      queue,
      log,
      projection,
      overall,
      overallStats: computeStats(overall, today),
      itemsDone: new Set(log.flatMap((e) => e.done ?? []).filter((id) => known.has(id))).size,
      groups: plan.groups.map((group) => ({
        ...group,
        trackers: group.tasks.map((task) => {
          const days = buildTaskDays(plan, projection, task, log, today);
          return {
            task,
            days,
            stats: computeStats(days, today),
            progress: progressFor(task.id, queue, log, projection, today),
          };
        }),
      })),
    };
  }, [today]);

  const totalDays = differenceInCalendarDays(parseISO(plan.end), parseISO(plan.start)) + 1;
  const elapsed = Math.min(
    Math.max(differenceInCalendarDays(parseISO(today), parseISO(plan.start)) + 1, 0),
    totalDays
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-24 px-6">
        <div className="container-wide">
          <h1 className="text-display mb-6 font-heading">Currently working on</h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl">
            {plan.title}: a bounded routine from{" "}
            {format(parseISO(plan.start), "MMM d")} to{" "}
            {format(parseISO(plan.end), "MMM d, yyyy")}. The goal isn't to
            hit dates. It's blocks of time each day, each one working through
            the next thing on its list, in public. Estimated finishes move with
            the actual pace.
          </p>
          <p className="text-sm uppercase tracking-wide text-muted-foreground mb-12">
            {elapsed === 0
              ? `Starts ${format(parseISO(plan.start), "EEEE, MMM d")}`
              : `Day ${elapsed} of ${totalDays}`}
          </p>

          <TodayPanel plan={plan} queue={queue} projection={projection} log={log} today={today} />

          <section className="bg-card border border-border rounded-lg p-6 md:p-8 mb-16">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-heading">Showing up</h2>
              <Legend />
            </div>
            <Heatmap days={overall} unit="tasks" />
            <div className="grid grid-cols-3 gap-6 mt-6 max-w-md">
              <Stat label="Active days" value={overallStats.activeDays} />
              <Stat label="Items done" value={itemsDone} />
              <Stat label="Hours" value={hoursText(overallStats.minutes)} />
            </div>
          </section>

          {groups.map((group) => (
            <section key={group.id} className="mb-16">
              <h2 className="text-3xl md:text-4xl font-heading mb-8">{group.label}</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                {group.trackers.map(({ task, days, stats, progress }) => (
                  <TaskTracker key={task.id} task={task} days={days} stats={stats} progress={progress} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CurrentlyWorkingOn;
