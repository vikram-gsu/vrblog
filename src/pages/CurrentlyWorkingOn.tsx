import { useMemo } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import Header from "@/components/layout/Header";
import Heatmap, { cellClass } from "@/components/tracker/Heatmap";
import { cn } from "@/lib/utils";
import {
  buildOverallDays,
  buildTaskDays,
  computeStats,
  getLog,
  getPlan,
  todayIso,
  type TrackerStats,
  type TrackerTask,
  type Weekday,
} from "@/lib/tracker";

const DAY_ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_SHORT: Record<Weekday, string> = {
  mon: "M", tue: "T", wed: "W", thu: "T", fri: "F", sat: "S", sun: "S",
};

function adherence(stats: TrackerStats) {
  if (stats.scheduledSoFar === 0) return "—";
  return `${Math.round((stats.scheduledDone / stats.scheduledSoFar) * 100)}%`;
}

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <div className="text-xl font-bold font-heading leading-none">{value}</div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
      {label}
    </div>
  </div>
);

const Schedule = ({ days }: { days: Weekday[] }) => (
  <div className="flex gap-1" aria-label={`Scheduled on ${days.join(", ")}`}>
    {DAY_ORDER.map((d, i) => (
      <span
        key={i}
        className={cn(
          "w-5 h-5 text-[10px] rounded-full flex items-center justify-center",
          days.includes(d)
            ? "bg-primary/15 text-primary font-semibold"
            : "text-muted-foreground/60"
        )}
      >
        {DAY_SHORT[d]}
      </span>
    ))}
  </div>
);

const TaskTracker = ({
  task,
  days,
  stats,
}: {
  task: TrackerTask;
  days: ReturnType<typeof buildTaskDays>;
  stats: TrackerStats;
}) => (
  <div className="bg-card border border-border rounded-lg p-6">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
      <div>
        <h3 className="text-xl font-heading">{task.label}</h3>
        {task.detail && (
          <p className="text-sm text-muted-foreground mt-1">{task.detail}</p>
        )}
      </div>
      <Schedule days={task.days} />
    </div>
    <Heatmap days={days} size="sm" />
    <div className="grid grid-cols-4 gap-4 mt-5">
      <Stat label="Streak" value={stats.currentStreak} />
      <Stat label="Best" value={stats.longestStreak} />
      <Stat label="On plan" value={adherence(stats)} />
      <Stat
        label="Hours"
        value={stats.minutes ? (stats.minutes / 60).toFixed(1) : 0}
      />
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
      <span className={cn("w-3 h-3 rounded-[3px]", cellClass({ status: "missed", level: 0 }))} />
      Missed
    </span>
    <span className="flex items-center gap-1.5">
      <span className={cn("w-3 h-3 rounded-[3px]", cellClass({ status: "upcoming", level: 0 }))} />
      Scheduled
    </span>
    <span className="flex items-center gap-1.5">
      <span className={cn("w-3 h-3 rounded-[3px]", cellClass({ status: "rest", level: 0 }))} />
      Rest
    </span>
  </div>
);

const CurrentlyWorkingOn = () => {
  const today = todayIso();
  const { plan, overall, overallStats, groups } = useMemo(() => {
    const plan = getPlan();
    const log = getLog();
    const overall = buildOverallDays(plan, log, today);
    return {
      plan,
      overall,
      overallStats: computeStats(overall, today),
      groups: plan.groups.map((group) => ({
        ...group,
        trackers: group.tasks.map((task) => {
          const days = buildTaskDays(plan, task, log, today);
          return { task, days, stats: computeStats(days, today) };
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
            finish everything. It's to show up on the days I said I would, in
            public.
          </p>
          <p className="text-sm uppercase tracking-wide text-muted-foreground mb-12">
            {elapsed === 0
              ? `Starts ${format(parseISO(plan.start), "EEEE, MMM d")}`
              : `Day ${elapsed} of ${totalDays}`}
          </p>

          <section className="bg-card border border-border rounded-lg p-6 md:p-8 mb-16">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-heading">Showing up</h2>
              <Legend />
            </div>
            <Heatmap days={overall} unit="tasks" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 max-w-xl">
              <Stat label="Day streak" value={overallStats.currentStreak} />
              <Stat label="Best streak" value={overallStats.longestStreak} />
              <Stat label="Active days" value={overallStats.daysDone} />
              <Stat
                label="Hours"
                value={overallStats.minutes ? (overallStats.minutes / 60).toFixed(1) : 0}
              />
            </div>
          </section>

          {groups.map((group) => (
            <section key={group.id} className="mb-16">
              <h2 className="text-3xl md:text-4xl font-heading mb-8">{group.label}</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                {group.trackers.map(({ task, days, stats }) => (
                  <TaskTracker key={task.id} task={task} days={days} stats={stats} />
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
