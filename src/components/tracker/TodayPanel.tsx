import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Check, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, type LogEntry, type TrackerPlan } from "@/lib/tracker";
import type { PlannedBlock, Projection, Queue, QueueItem } from "@/lib/schedule";

interface TodayPanelProps {
  plan: TrackerPlan;
  queue: Queue;
  /** Planned days from today on. */
  projection: Projection;
  log: LogEntry[];
  today: string;
}

function clamp(date: string, min: string, max: string) {
  if (date < min) return min;
  if (date > max) return max;
  return date;
}

function hours(h: number) {
  return `${Number(h.toFixed(1))} h`;
}

const ItemTitle = ({ item }: { item: QueueItem }) =>
  item.link ? (
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
    <>{item.title}</>
  );

const Tick = ({ done, show }: { done: boolean; show: boolean }) =>
  show ? (
    <span
      className={cn(
        "mt-1 w-4 h-4 shrink-0 rounded-full flex items-center justify-center",
        done ? "bg-primary text-primary-foreground" : "border border-foreground/30"
      )}
      aria-label={done ? "Done" : "Not done yet"}
    >
      {done && <Check size={10} strokeWidth={3} />}
    </span>
  ) : (
    <span className="mt-2.5 w-1.5 h-1.5 mx-[5px] shrink-0 rounded-full bg-foreground/30" />
  );

const BlockRow = ({ block, label, isToday }: { block: PlannedBlock; label?: string; isToday: boolean }) => (
  <li className="grid grid-cols-[5.5rem_1fr] gap-4 py-4 first:pt-0 last:pb-0">
    <div className="text-sm tabular-nums text-muted-foreground pt-0.5">{block.time}</div>
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
        {block.label}
        {label && label !== block.label && ` · ${label}`}
      </div>
      {block.items.length === 0 ? (
        <p className="text-muted-foreground">Open: nothing left in this block's tracks.</p>
      ) : (
        <ul className="space-y-1">
          {block.items.map(({ item, done, continued, continues }, i) => (
            <li key={i} className={cn("flex gap-2", done && "text-muted-foreground line-through")}>
              <Tick done={done} show={isToday} />
              <span>
                <ItemTitle item={item} />
                {(continued || continues) && (
                  <span className="text-muted-foreground text-sm">
                    {" "}
                    ({[continued && "continued", continues && "runs over"].filter(Boolean).join(", ")})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </li>
);

/**
 * Today's time blocks with the next items in each. Earlier days show what was logged;
 * later days are a projection that assumes the days before go as planned.
 */
const TodayPanel = ({ plan, queue, projection, log, today }: TodayPanelProps) => {
  const initial = clamp(today, plan.start, plan.end);
  const [date, setDate] = useState(initial);
  const labels = new Map(plan.groups.flatMap((g) => g.tasks).map((t) => [t.id, t.label]));
  const titles = new Map(Object.values(queue).flat().map((i) => [i.id, i.title]));

  const day = projection.days.find((d) => d.date === date);
  const entries = log.filter((e) => e.date === date);
  const isPast = date < today;
  const isToday = date === today;
  const items = day ? day.blocks.flatMap((b) => b.items) : [];

  const heading = isToday ? "Today" : format(parseISO(date), "EEEE");
  const summary = isPast
    ? entries.length
      ? `${entries.length} logged`
      : "Nothing logged"
    : day && day.hours
      ? [
          `${hours(day.hours)} planned`,
          isToday && items.length ? `${items.filter((i) => i.done).length}/${items.length} done` : null,
          isToday ? null : "if the days before go as planned",
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <section className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading">{heading}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {format(parseISO(date), "EEE, MMM d")}
            {day?.note && ` · ${day.note}`}
            {summary && ` · ${summary}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {date !== initial && (
            <button onClick={() => setDate(initial)} className="text-sm text-primary link-underline mr-2">
              Back to today
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

      {isPast ? (
        entries.length === 0 ? (
          <p className="text-muted-foreground">Nothing logged.</p>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((e, i) => (
              <li key={i} className="py-4 first:pt-0 last:pb-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  {labels.get(e.task) ?? e.task}
                  {e.minutes ? ` · ${hours(e.minutes / 60)}` : ""}
                </div>
                <ul className="space-y-1">
                  {(e.done?.length ? e.done.map((id) => titles.get(id) ?? id) : [e.note ?? "Logged"]).map(
                    (t, j) => (
                      <li key={j}>{t}</li>
                    )
                  )}
                </ul>
              </li>
            ))}
          </ul>
        )
      ) : !day || day.blocks.length === 0 ? (
        <p className="text-muted-foreground">No blocks planned. Day off.</p>
      ) : (
        <ul className="divide-y divide-border">
          {day.blocks.map((block, i) => (
            <BlockRow key={i} block={block} label={block.task && labels.get(block.task)} isToday={isToday} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default TodayPanel;
