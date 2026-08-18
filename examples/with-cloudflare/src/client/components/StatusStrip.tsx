import type { InspectorStatus } from "../../shared/protocol.js";
import { CopyButton } from "./CopyButton.js";

const STATE_COLORS: Record<string, string> = {
  idle: `bg-ink-line-strong`,
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
    <span className="text-2xs uppercase tracking-wide text-ink-muted">
      {label}
    </span>
    <span className="font-mono text-xs text-ink-text">{value}</span>
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
  <section className="flex shrink-0 flex-wrap items-center gap-6 border-b border-ink-line bg-ink-panel/50 px-4 py-2.5">
    <div className="flex items-center gap-2">
      <span
        className={`size-2.5 rounded-full ${STATE_COLORS[status.state] ?? `bg-ink-line-strong`}`}
        aria-hidden
      />
      <span className="text-sm font-medium text-ink-text">{status.state}</span>
    </div>

    {/* Truncated to fit, so the full id is only reachable by copying it —
        which is also the only thing you would do with a session id. */}
    <div className="flex flex-col">
      <span className="text-2xs uppercase tracking-wide text-ink-muted">
        Session
      </span>
      {status.sessionId === null ? (
        <span className="font-mono text-xs text-ink-text">—</span>
      ) : (
        <CopyButton
          value={status.sessionId}
          label="Copy session id"
          className="-mx-1 flex items-center gap-1 rounded px-1 font-mono text-xs text-ink-text hover:bg-ink-line"
        >
          {`${status.sessionId.slice(0, 8)}…`}
        </CopyButton>
      )}
    </div>
    <Field label="Events" value={String(eventCount)} />
    <Field
      label="Intents"
      value={status.intents.length === 0 ? `—` : String(status.intents.length)}
    />
  </section>
);
