import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { weekdayOf, type TrackerDay } from "@/lib/tracker";

const LEVEL_CLASSES = [
  "",
  "bg-primary/30",
  "bg-primary/55",
  "bg-primary/80",
  "bg-primary",
];

const ROW_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
const MONDAY_OFFSET = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };

export function cellClass(day: Pick<TrackerDay, "status" | "level">) {
  switch (day.status) {
    case "done":
      return LEVEL_CLASSES[day.level];
    case "missed":
      return "bg-secondary/60 ring-1 ring-inset ring-destructive/50";
    case "upcoming":
      return "border border-dashed border-foreground/30";
    default:
      return "bg-secondary/40";
  }
}

function describe(day: TrackerDay, unit: "minutes" | "tasks") {
  const date = format(parseISO(day.date), "EEE, MMM d");
  if (day.status === "done") {
    const notes = day.entries
      .map((e) =>
        [unit === "tasks" ? e.task : null, e.minutes ? `${e.minutes} min` : null, e.note]
          .filter(Boolean)
          .join(" · ")
      )
      .filter(Boolean);
    return [date, ...notes].join("\n");
  }
  if (day.status === "missed") return `${date}\nScheduled, missed`;
  if (day.status === "upcoming") return `${date}\nScheduled`;
  return `${date}\nRest day`;
}

interface HeatmapProps {
  days: TrackerDay[];
  unit?: "minutes" | "tasks";
  size?: "sm" | "md";
}

/** GitHub-style grid: one column per week (Mon–Sun), one square per day. */
const Heatmap = ({ days, unit = "minutes", size = "md" }: HeatmapProps) => {
  if (days.length === 0) return null;

  // Pad the front so the first column starts on a Monday.
  const lead = MONDAY_OFFSET[weekdayOf(days[0].date)];
  const cells: (TrackerDay | null)[] = [...Array(lead).fill(null), ...days];
  const weeks: (TrackerDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const cell = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  const gap = size === "sm" ? "gap-1" : "gap-1.5";

  return (
    <div className="overflow-x-auto">
      <div className={cn("inline-flex", gap)}>
        <div className={cn("flex flex-col pr-1", gap)} aria-hidden>
          <div className="h-3" />
          {ROW_LABELS.map((label, i) => (
            <div
              key={i}
              className={cn(
                "text-[10px] leading-none text-muted-foreground flex items-center",
                cell,
                "w-auto"
              )}
            >
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, w) => {
          const first = week.find(Boolean);
          // Label a column with its month when it's the first column or a new month starts in it.
          const showMonth =
            first && (w === 0 || week.some((d) => d?.date.endsWith("-01")));
          const monthDate = week.find((d) => d?.date.endsWith("-01")) ?? first;
          return (
            <div key={w} className={cn("flex flex-col", gap)}>
              <div
                // Fixed width so a month name overflows instead of widening its column.
                className={cn(
                  "h-3 text-[10px] leading-none text-muted-foreground whitespace-nowrap overflow-visible",
                  cell.split(" ")[0]
                )}
              >
                {showMonth && monthDate ? format(parseISO(monthDate.date), "MMM") : ""}
              </div>
              {week.map((day, d) =>
                day ? (
                  <div
                    key={day.date}
                    title={describe(day, unit)}
                    className={cn("rounded-[3px]", cell, cellClass(day))}
                  />
                ) : (
                  <div key={`pad-${d}`} className={cell} />
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Heatmap;
