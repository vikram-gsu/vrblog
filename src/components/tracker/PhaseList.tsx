import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrackerTask } from "@/lib/tracker";
import type { Phase, Phases } from "@/lib/plan";
import { ItemTitle } from "./NextUp";

const Tick = ({ done }: { done: boolean }) => (
  <span
    className={cn(
      "mt-1 w-4 h-4 shrink-0 rounded-full flex items-center justify-center",
      done ? "bg-primary text-primary-foreground" : "border border-foreground/30"
    )}
    aria-label={done ? "Done" : "Not done yet"}
  >
    {done && <Check size={10} strokeWidth={3} />}
  </span>
);

const PhaseCard = ({
  phase,
  n,
  state,
  labels,
  done,
}: {
  phase: Phase;
  n: number;
  state: "done" | "current" | "later";
  labels: Map<string, string>;
  done: Set<string>;
}) => {
  const required = phase.items.filter((i) => !i.optional);
  const count = required.filter((i) => done.has(i.id)).length;
  return (
    <details
      open={state === "current"}
      className={cn(
        "bg-card border rounded-lg p-6 group",
        state === "current" ? "border-primary/60" : "border-border"
      )}
    >
      <summary className="cursor-pointer list-none flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-heading">
          Phase {n} · {phase.label}
        </h3>
        <span className="text-sm text-muted-foreground">
          {state === "current" ? "Current · " : state === "done" ? "Done · " : ""}
          {count}/{required.length} ·{" "}
          {phase.tracks.map((t) => labels.get(t)?.split(" · ")[0] ?? t).join(" + ")}
        </span>
      </summary>
      <ul className="space-y-1.5 mt-5">
        {phase.items.map((item) => (
          <li
            key={item.id}
            className={cn("flex gap-2", done.has(item.id) && "text-muted-foreground line-through")}
          >
            <Tick done={done.has(item.id)} />
            <span>
              <ItemTitle item={item} />
              {item.optional && <span className="text-muted-foreground text-sm"> (optional)</span>}
            </span>
          </li>
        ))}
      </ul>
      {phase.background && <p className="text-sm text-muted-foreground mt-4">{phase.background}</p>}
      <p className="text-sm mt-4">
        <span className="text-muted-foreground">Done when: </span>
        {phase.exit}
      </p>
    </details>
  );
};

/** The phases in order: done ones collapsed, the current one open. */
const PhaseList = ({
  phases,
  current,
  tasks,
  done,
}: {
  phases: Phases;
  current?: Phase;
  tasks: TrackerTask[];
  done: Set<string>;
}) => {
  const labels = new Map(tasks.map((t) => [t.id, t.label]));
  const at = current ? phases.phases.indexOf(current) : phases.phases.length;
  return (
    <div className="space-y-4">
      {phases.phases.map((phase, i) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          n={i + 1}
          state={i < at ? "done" : i === at ? "current" : "later"}
          labels={labels}
          done={done}
        />
      ))}
      {phases.cut && <p className="text-sm text-muted-foreground pt-2">Cut line, the first thing dropped: {phases.cut}.</p>}
    </div>
  );
};

export default PhaseList;
