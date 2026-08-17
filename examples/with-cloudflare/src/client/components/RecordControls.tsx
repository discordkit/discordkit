import {
  Button,
  CheckboxButton,
  CheckboxField,
  Dialog,
  DialogTrigger,
  Popover,
  ToggleButton
} from "react-aria-components";
import { Circle, Filter, Pause } from "lucide-react";
import type { InspectorStatus } from "../../shared/protocol.js";

/**
 * Record/pause plus a per-type capture allowlist, modelled on Chrome DevTools'
 * Network panel.
 *
 * Both are **local** decisions and never touch the Gateway connection. That
 * distinction is the point: intents are a subscription contract with Discord
 * that can only change in `IDENTIFY` (so changing them costs one of the 1000
 * daily session starts), whereas what you keep is free to change at any time.
 * Pausing therefore leaves the session and its heartbeat alive.
 */
export const RecordControls = ({
  status,
  onRecordingChange,
  onFilterChange
}: {
  status: InspectorStatus;
  onRecordingChange: (recording: boolean) => void;
  onFilterChange: (types: readonly string[] | null) => void;
}): React.JSX.Element => {
  const { recording, recordFilter, seenTypes } = status;
  const filtering = recordFilter !== null;

  const toggleType = (type: string): void => {
    // `null` means "record everything", so the first exclusion has to
    // materialise the full list minus that type — otherwise unchecking one box
    // would silently drop every other type too.
    const current = recordFilter ?? seenTypes;
    const next = current.includes(type)
      ? current.filter((name) => name !== type)
      : [...current, type];
    // Back to "everything" when nothing is excluded, so the UI doesn't sit on
    // a filter that is indistinguishable from having none.
    onFilterChange(next.length === seenTypes.length ? null : next);
  };

  return (
    // Inline in the timeline header: no border or padding of its own, since it
    // sits alongside the panel's other controls rather than owning a strip.
    <div className="flex shrink-0 items-center gap-1.5">
      <ToggleButton
        isSelected={recording}
        onChange={onRecordingChange}
        aria-label={recording ? `Pause recording` : `Resume recording`}
        className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
          recording
            ? `bg-rose-500/15 text-danger hover:bg-rose-500/25`
            : `text-ink-body hover:bg-ink-line hover:text-ink-text`
        }`}
      >
        {recording ? (
          <>
            <Circle size={9} className="fill-current" aria-hidden />
            Recording
          </>
        ) : (
          <>
            <Pause size={11} aria-hidden />
            Paused
          </>
        )}
      </ToggleButton>

      <DialogTrigger>
        <Button
          isDisabled={seenTypes.length === 0}
          className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors disabled:opacity-40 ${
            filtering
              ? `bg-indigo-500/15 text-accent`
              : `text-ink-body hover:bg-ink-line hover:text-ink-text`
          }`}
        >
          <Filter size={11} aria-hidden />
          {/* Fixed width for the same reason as the guild trigger: it anchors
              a popover, and a reflowing label drags the panel with it. */}
          <span className="w-20 text-left tabular-nums">
            {filtering
              ? `${recordFilter.length} of ${seenTypes.length}`
              : `All types`}
          </span>
        </Button>

        <Popover className="rounded border border-ink-line-strong bg-ink-panel shadow-lg">
          <Dialog className="max-h-80 w-64 overflow-y-auto p-2 outline-none">
            <div className="mb-1.5 flex items-center justify-between gap-2 border-b border-ink-line pb-1.5">
              <span className="text-2xs font-medium text-ink-body">
                Record these events
              </span>
              <Button
                onPress={() => {
                  onFilterChange(null);
                }}
                isDisabled={!filtering}
                className="rounded px-1.5 py-0.5 text-2xs text-ink-body hover:bg-ink-line hover:text-ink-text disabled:opacity-40"
              >
                Select all
              </Button>
            </div>

            {/* Built from types actually seen, not all 84 documented ones —
                a list of events this bot never receives is noise. */}
            {seenTypes.map((type) => (
              <CheckboxField
                key={type}
                isSelected={
                  recordFilter === null || recordFilter.includes(type)
                }
                onChange={() => {
                  toggleType(type);
                }}
              >
                <CheckboxButton className="group flex w-full cursor-default items-center gap-2 rounded px-1.5 py-1 font-mono text-2xs text-ink-body hover:bg-ink-line/60">
                  <span className="flex size-3.5 shrink-0 items-center justify-center rounded-sm border border-ink-line-strong group-selected:border-indigo-500 group-selected:bg-indigo-500">
                    <svg
                      viewBox="0 0 12 12"
                      className="size-2.5 text-white opacity-0 group-selected:opacity-100"
                      aria-hidden
                    >
                      <path
                        d="M2 6l3 3 5-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="truncate">{type}</span>
                </CheckboxButton>
              </CheckboxField>
            ))}
          </Dialog>
        </Popover>
      </DialogTrigger>

      {!recording ? (
        <span className="text-2xs text-ink-muted">connection still live</span>
      ) : null}
    </div>
  );
};
