import { AlertTriangle } from "lucide-react";
import type { InspectedEvent } from "../../shared/protocol.js";

/**
 * Turn the camelized payload discordkit hands your handler back into Discord's
 * snake_case wire shape, so the two can be compared side by side.
 *
 * This is presentation-only — the point is to make the transform legible, since
 * "why doesn't `channel_id` exist on my object?" is a real question the
 * boundary raises.
 */
const toSnake = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(toSnake);
  if (typeof value !== `object` || value === null) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [
      key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`),
      toSnake(nested)
    ])
  );
};

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

  const payload = raw ? toSnake(event.data) : event.data;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-2">
        <h2 className="font-mono text-sm text-slate-200">{event.type}</h2>
        <div className="flex rounded border border-slate-700 text-[11px]">
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

      <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
};
