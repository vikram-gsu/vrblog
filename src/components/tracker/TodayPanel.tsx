import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Check, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, type Agenda, type LogEntry, type TrackerPlan } from "@/lib/tracker";

interface TodayPanelProps {
  plan: TrackerPlan;
  agenda: Agenda;
  log: LogEntry[];
  today: string;
}

function clamp(date: string, min: string, max: string) {
  if (date < min) return min;
  if (date > max) return max;
  return date;
}

/** The day's assignments, with arrows to look back at or ahead to any day in the plan. */
const TodayPanel = ({ plan, agenda, log, today }: TodayPanelProps) => {
  const initial = clamp(today, plan.start, plan.end);
  const [date, setDate] = useState(initial);

  const assignments = agenda[date] || {};
  const tasks = plan.groups
    .flatMap((g) => g.tasks)
    .filter((t) => assignments[t.id]?.length);
  const done = new Set(log.filter((e) => e.date === date).map((e) => e.task));

  const heading =
    date === today
      ? "Today"
      : date === plan.start && today < plan.start
        ? "Day one"
        : format(parseISO(date), "EEEE");

  return (
    <section className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading">{heading}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {format(parseISO(date), "EEE, MMM d")}
            {tasks.length > 0 && ` · ${done.size}/${tasks.length} done`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {date !== initial && (
            <button
              onClick={() => setDate(initial)}
              className="text-sm text-primary link-underline mr-2"
            >
              {initial === today ? "Back to today" : "Back to day one"}
            </button>
          )}
          <button
            onClick={() => setDate(addDays(date, -1))}
            disabled={date <= plan.start}
            className="p-2 rounded-md hover:bg-secondary/50 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous day"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setDate(addDays(date, 1))}
            disabled={date >= plan.end}
            className="p-2 rounded-md hover:bg-secondary/50 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Next day"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground">Nothing scheduled. Rest day.</p>
      ) : (
        <ul className="divide-y divide-border">
          {tasks.map((task) => {
            const isDone = done.has(task.id);
            return (
              <li key={task.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    "mt-1 w-5 h-5 shrink-0 rounded-full flex items-center justify-center",
                    isDone
                      ? "bg-primary text-primary-foreground"
                      : "border border-foreground/30"
                  )}
                  aria-label={isDone ? "Done" : "Not done yet"}
                >
                  {isDone && <Check size={12} strokeWidth={3} />}
                </span>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {task.label}
                  </div>
                  <ul className="space-y-1">
                    {assignments[task.id].map((item, i) => (
                      <li key={i} className={cn(isDone && "text-muted-foreground line-through")}>
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-baseline gap-1.5 hover:text-primary transition-colors"
                          >
                            {item.title}
                            <ExternalLink size={12} className="shrink-0 opacity-60" />
                          </a>
                        ) : (
                          item.title
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default TodayPanel;
