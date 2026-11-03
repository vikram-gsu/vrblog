import { ExternalLink } from "lucide-react";
import type { TrackerTask } from "@/lib/tracker";
import { nextFor, type Phase, type PlanItem, type Tracks } from "@/lib/plan";

export const ItemTitle = ({ item }: { item: PlanItem }) =>
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

const Row = ({ task, tracks, done }: { task: TrackerTask; tracks: Tracks; done: Set<string> }) => {
  const { item, waitingOn } = nextFor(tracks, task.id, done);
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{task.label}</div>
      {!item ? (
        <p className="text-muted-foreground">All done</p>
      ) : waitingOn ? (
        <p>
          <ItemTitle item={waitingOn} />
          <span className="text-muted-foreground text-sm"> (first, then: {item.title})</span>
        </p>
      ) : (
        <p>
          <ItemTitle item={item} />
          {item.optional && <span className="text-muted-foreground text-sm"> (optional)</span>}
        </p>
      )}
    </li>
  );
};

/** The next item in each of the current phase's tracks, and in each interview prep track. */
const NextUp = ({
  phase,
  phaseTasks,
  prepTasks,
  tracks,
  done,
}: {
  phase?: Phase;
  phaseTasks: TrackerTask[];
  prepTasks: TrackerTask[];
  tracks: Tracks;
  done: Set<string>;
}) => (
  <section className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8">
    <h2 className="text-2xl md:text-3xl font-heading">Next up</h2>
    <p className="text-sm text-muted-foreground mt-1 mb-6">
      {phase ? `${phase.label} · done when: ${phase.exit}` : "Every phase is done."}
    </p>
    <div className="grid md:grid-cols-2 gap-8">
      <ul className="divide-y divide-border">
        {phaseTasks.map((t) => (
          <Row key={t.id} task={t} tracks={tracks} done={done} />
        ))}
        {phase?.background && (
          <li className="py-4 last:pb-0 text-sm text-muted-foreground">{phase.background}</li>
        )}
      </ul>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-4 md:hidden">Interview prep</div>
        <ul className="divide-y divide-border">
          {prepTasks.map((t) => (
            <Row key={t.id} task={t} tracks={tracks} done={done} />
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default NextUp;
