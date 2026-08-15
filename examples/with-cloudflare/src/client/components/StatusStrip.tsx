import type { InspectorStatus } from "../../shared/protocol.js";

const STATE_COLORS: Record<string, string> = {
  idle: `bg-slate-600`,
  connecting: `bg-amber-500 animate-pulse`,
  identifying: `bg-amber-500 animate-pulse`,
  resuming: `bg-sky-500 animate-pulse`,
  ready: `bg-emerald-500`,
  closed: `bg-rose-500`
};

const Field = ({
  label,
  value
}: {
  label: string;
  value: string;
}): React.JSX.Element => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <span className="font-mono text-xs text-slate-200">{value}</span>
  </div>
);

export const StatusStrip = ({
  status,
  eventCount
}: {
  status: InspectorStatus;
  /**
   * Taken from the client's own event list rather than `status.eventCount`: the
   * DO only rebroadcasts `status` on a state *change*, so once the connection
   * settles on `ready` the embedded count stops updating and reads 0 while
   * events stream in. The client already has every event, so counting here
   * can't drift.
   */
  eventCount: number;
}): React.JSX.Element => (
  <section className="flex shrink-0 flex-wrap items-center gap-6 border-b border-slate-800 bg-slate-900/30 px-4 py-2.5">
    <div className="flex items-center gap-2">
      <span
        className={`size-2.5 rounded-full ${STATE_COLORS[status.state] ?? `bg-slate-600`}`}
        aria-hidden
      />
      <span className="text-sm font-medium text-slate-200">{status.state}</span>
    </div>

    <Field
      label="Session"
      value={status.sessionId ? `${status.sessionId.slice(0, 8)}…` : `—`}
    />
    <Field label="Events" value={String(eventCount)} />
    <Field
      label="Intents"
      value={status.intents.length === 0 ? `—` : String(status.intents.length)}
    />

    {status.missingIntents.length > 0 && status.state === `ready` ? (
      <p className="text-xs text-amber-400">
        Not requested:{` `}
        <span className="font-mono">{status.missingIntents.join(`, `)}</span>
        {` `}— events gated behind these will never arrive.
      </p>
    ) : null}
  </section>
);
