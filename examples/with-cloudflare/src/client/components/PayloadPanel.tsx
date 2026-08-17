import { AlertTriangle } from "lucide-react";
import { isObject } from "@discordkit/core/utils/isObject";
import { toCamelKeys } from "@discordkit/core/utils/toCamelKeys";
import { Button, Tooltip, TooltipTrigger } from "react-aria-components";
import type { InspectedEvent } from "../../shared/protocol.js";
import { CopyButton } from "./CopyButton.js";
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
        <p className="text-xs text-ink-muted">
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
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-ink-line px-4 py-2">
        <h2 className="truncate font-mono text-sm text-ink-text">
          {event.type}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {/* Named for the transform rather than for us: "camel"/"snake" says
              what you get, where "discordkit"/"wire" needed you to already know
              which one camelizes. Tooltips carry the why. */}
          <div className="flex rounded border border-ink-line-strong text-2xs">
            <TooltipTrigger delay={400}>
              <Button
                onPress={() => {
                  onToggleRaw(false);
                }}
                className={`px-2 py-1 ${raw ? `text-ink-muted hover:text-ink-body` : `bg-ink-line text-ink-text`}`}
              >
                camel
              </Button>
              <Tooltip
                offset={4}
                className="max-w-64 rounded border border-ink-line-strong bg-ink-panel px-2 py-1 text-2xs text-ink-body shadow-lg"
              >
                camelCase — the shape discordkit hands your typed handlers.
              </Tooltip>
            </TooltipTrigger>
            <TooltipTrigger delay={400}>
              <Button
                onPress={() => {
                  onToggleRaw(true);
                }}
                className={`px-2 py-1 ${raw ? `bg-ink-line text-ink-text` : `text-ink-muted hover:text-ink-body`}`}
              >
                snake
              </Button>
              <Tooltip
                offset={4}
                className="max-w-64 rounded border border-ink-line-strong bg-ink-panel px-2 py-1 text-2xs text-ink-body shadow-lg"
              >
                snake_case — exactly what Discord sent over the wire.
              </Tooltip>
            </TooltipTrigger>
          </div>

          <CopyButton
            value={JSON.stringify(payload, null, 2)}
            label="Copy event payload"
            className="flex items-center gap-1 rounded border border-ink-line-strong px-2 py-1 text-2xs text-ink-body hover:bg-ink-line hover:text-ink-text"
          >
            Copy
          </CopyButton>
        </div>
      </div>

      {event.warnings.map((warning) => (
        <div
          key={warning.kind}
          className="flex items-start gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5"
        >
          <AlertTriangle
            size={14}
            className="mt-0.5 shrink-0 text-warn"
            aria-hidden
          />
          <p className="text-xs leading-relaxed text-warn">{warning.message}</p>
        </div>
      ))}

      <div className="border-b border-ink-line px-4 py-2 text-2xs text-ink-muted">
        {event.intents.length === 0 ? (
          <>Always delivered — no intent gates this event.</>
        ) : (
          <>
            Gated by{` `}
            <span className="font-mono text-ink-body">
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
