import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import Header from "@/components/layout/Header";
import Heatmap, { cellClass } from "@/components/tracker/Heatmap";
import NextUp from "@/components/tracker/NextUp";
import PhaseList from "@/components/tracker/PhaseList";
import { cn } from "@/lib/utils";
import {
  buildOverallDays,
  buildTaskDays,
  computeStats,
  getLog,
  getPhases,
  getPlan,
  getQueue,
  todayIso,
  type TrackerStats,
  type TrackerTask,
} from "@/lib/tracker";
import { allTracks, currentPhase, doneIds, nextFor, type Next } from "@/lib/plan";

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

const TaskTracker = ({
  task,
  days,
  stats,
  done,
  total,
  next,
  active,
}: {
  task: TrackerTask;
  days: ReturnType<typeof buildTaskDays>;
  stats: TrackerStats;
  done: number;
  total: number;
  next: Next;
  active: boolean;
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
        <span className="text-muted-foreground">{next.item ? (active ? "Next: " : "Later · starts with: ") : ""}</span>
        {(next.waitingOn ?? next.item)?.title ?? (total ? "All done" : "Nothing queued")}
      </p>
    </div>
    <Heatmap days={days} size="sm" />
    <div className="grid grid-cols-2 gap-4 mt-5 max-w-xs">
      <Stat label="Done" value={total ? `${done}/${total}` : "—"} />
      <Stat label="Hours" value={hoursText(stats.minutes)} />
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
      <span className={cn("w-3 h-3 rounded-[3px]", cellClass({ status: "rest", level: 0 }))} />
      Nothing logged
    </span>
  </div>
);

const CurrentlyWorkingOn = () => {
  const today = todayIso();
  const data = useMemo(() => {
    const plan = getPlan();
    const phases = getPhases();
    const log = getLog();
    const tracks = allTracks(phases, getQueue());
    const done = doneIds(log);
    const phase = currentPhase(phases, done);
    const overall = buildOverallDays(plan, log);
    const known = new Set(Object.values(tracks).flat().map((i) => i.id));
    const tasks = plan.groups.flatMap((g) => g.tasks);
    return {
      plan,
      phases,
      tracks,
      done,
      phase,
      tasks,
      overall,
      overallStats: computeStats(overall, today),
      itemsDone: [...done].filter((id) => known.has(id)).length,
      groups: plan.groups.map((group) => ({
        ...group,
        trackers: group.tasks.map((task) => {
          const days = buildTaskDays(plan, task, log);
          const items = tracks[task.id] ?? [];
          return {
            task,
            days,
            stats: computeStats(days, today),
            done: items.filter((i) => done.has(i.id)).length,
            total: items.length,
            next: nextFor(tracks, task.id, done),
            // Learning tracks are active only in their phase; prep runs alongside throughout.
            active: group.id !== "learning" || !!phase?.tracks.includes(task.id),
          };
        }),
      })),
    };
  }, [today]);
  const { plan, phases, tracks, done, phase, tasks, overall, overallStats, itemsDone, groups } = data;
  const learning = new Set(plan.groups.find((g) => g.id === "learning")?.tasks.map((t) => t.id));

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-24 px-6">
        <div className="container-wide">
          <h1 className="text-display mb-6 font-heading">Currently working on</h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl">
            {plan.title}: a learning plan in phases, at most two tracks at a time, with
            interview prep alongside. The goal is to be through it by the end of{" "}
            {format(parseISO(plan.end), "MMMM yyyy")}. Nothing else has a date: each track just
            works on its next thing, and a phase is done when its exit check passes.
          </p>
          <p className="text-sm uppercase tracking-wide text-muted-foreground mb-12">
            Started {format(parseISO(plan.start), "MMM d")}
          </p>

          <NextUp
            phase={phase}
            phaseTasks={tasks.filter((t) => learning.has(t.id) && phase?.tracks.includes(t.id))}
            prepTasks={tasks.filter((t) => !learning.has(t.id))}
            tracks={tracks}
            done={done}
          />

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

          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-heading mb-8">The phases</h2>
            <PhaseList phases={phases} current={phase} tasks={tasks} done={done} />
          </section>

          {groups.map((group) => (
            <section key={group.id} className="mb-16">
              <h2 className="text-3xl md:text-4xl font-heading mb-8">{group.label}</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                {group.trackers.map((t) => (
                  <TaskTracker key={t.task.id} {...t} />
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
