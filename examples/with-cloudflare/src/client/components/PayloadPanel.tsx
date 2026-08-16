import { AlertTriangle } from "lucide-react";
import { isObject } from "@discordkit/core/utils/isObject";
import { toCamelKeys } from "@discordkit/core/utils/toCamelKeys";
import type { InspectedEvent } from "../../shared/protocol.js";
import { JsonTree } from "./JsonTree.js";

export const PayloadPanel = ({
  event,
  raw,
  onToggleRaw
}: {
  event: InspectedEvent | null;
  raw: boolean;
  onToggleRaw: (raw: boolean) => void;
}): React.JSX.Element => {
  if (!event) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-xs text-slate-600">
          Select an event to inspect its payload.
        </p>
      </div>
    );
  }

  // `event.data` is stored exactly as Discord sent it: the inspector subscribes
  // via `onDispatch`, which deliberately delivers WIRE-shaped payloads (the
  // typed fan-out is what camelizes, and only for events with a subscriber).
  //
  // So "wire" is the stored value and "discordkit" is the transformed one —
  // the opposite of what this panel used to assume. It previously ran a
  // hand-rolled snake_case conversion over data that was *already* snake_case,
  // which is a no-op, so the toggle appeared to do nothing.
  //
  // Using the package's own `toCamelKeys` rather than an inverse means this
  // shows the exact transform your handlers receive, and can't drift from it.
  const payload =
    raw || !isObject(event.data) ? event.data : toCamelKeys(event.data);

  return (
    // `min-w-0` matters as much as `min-h-0`: a flex item defaults to
    // `min-width: auto`, meaning "at least as wide as my content". The <pre>
    // below holds JSON with long unbreakable lines, so without this the panel
    // sizes to the widest line and drags the whole page into a horizontal
    // scroll — measured 7280px wide in a 914px viewport.
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-800 px-4 py-2">
        <h2 className="truncate font-mono text-sm text-slate-200">
          {event.type}
        </h2>
        <div className="flex shrink-0 rounded border border-slate-700 text-[11px]">
          <button
            type="button"
            onClick={() => {
              onToggleRaw(false);
            }}
            className={`px-2 py-1 ${raw ? `text-slate-500` : `bg-slate-800 text-slate-200`}`}
          >
            discordkit
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleRaw(true);
            }}
            className={`px-2 py-1 ${raw ? `bg-slate-800 text-slate-200` : `text-slate-500`}`}
          >
            wire
          </button>
        </div>
      </div>

      {event.warnings.map((warning) => (
        <div
          key={warning.kind}
          className="flex items-start gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5"
        >
          <AlertTriangle
            size={14}
            className="mt-0.5 shrink-0 text-amber-400"
            aria-hidden
          />
          <p className="text-xs leading-relaxed text-amber-200">
            {warning.message}
          </p>
        </div>
      ))}

      <div className="border-b border-slate-800 px-4 py-2 text-[11px] text-slate-500">
        {event.intents.length === 0 ? (
          <>Always delivered — no intent gates this event.</>
        ) : (
          <>
            Gated by{` `}
            <span className="font-mono text-slate-400">
              {event.intents.join(` or `)}
            </span>
          </>
        )}
      </div>

      {/* `overflow-y-auto` only — the tree wraps long values instead of
          scrolling sideways, so there is no horizontal axis to scroll. */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <JsonTree data={payload} />
      </div>
    </div>
  );
};
