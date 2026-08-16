import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "react-aria-components";
import type { InspectedEvent } from "../../shared/protocol.js";

/**
 * A Chrome-network-style overview strip: event volume over time, with a
 * drag-to-select window that narrows the list below.
 *
 * The Gateway is bursty — a bot join, a deploy, or a message spike each show up
 * as a visible cluster — so "what happened around then?" is the natural way to
 * navigate a long session. A text filter cannot express that, because the
 * interesting events are usually the ones you cannot name yet.
 */

export interface TimeSelection {
  /** Epoch ms, inclusive. `null` means unbounded on that end. */
  from: number | null;
  to: number | null;
}

/** Buckets across the strip. Fine enough to show bursts, coarse enough to stay legible. */
const BUCKETS = 120;

/** Which end of an existing selection a drag is moving. */
interface DragMode {
  kind: `new` | `from` | `to`;
}

/** Below this fraction a drag reads as a click, and clears rather than selects. */
const MIN_SPAN = 0.005;

interface Bucket {
  count: number;
  /** Event types in this bucket, most frequent first, for the tooltip. */
  types: Array<[string, number]>;
  warnings: number;
  from: number;
  to: number;
}

export const TimeRange = ({
  events,
  range,
  onChange
}: {
  events: InspectedEvent[];
  range: TimeSelection;
  onChange: (range: TimeSelection) => void;
}): React.JSX.Element | null => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragMode | null>(null);
  // Live drag edges, as 0-1 fractions. Committed to `range` on pointer up.
  const [draft, setDraft] = useState<{ from: number; to: number } | null>(null);
  // Mirrors `draft` so the pointerup handler can read the latest value without
  // going through a state updater (see `up` below).
  const draftRef = useRef<{ from: number; to: number } | null>(null);
  draftRef.current = draft;
  const [hover, setHover] = useState<{ index: number; x: number } | null>(null);

  // While a range is selected the axis is FROZEN at the extent it had when the
  // selection was made. Without this the axis keeps growing with each new
  // event, so a fixed epoch-ms window occupies an ever-smaller slice of the
  // strip and appears to drift left — and on a busy stream the selection
  // scrolls out from under itself entirely.
  const frozen = useRef<{ first: number; last: number } | null>(null);
  const selecting = range.from !== null || range.to !== null;
  if (!selecting) frozen.current = null;
  else if (frozen.current === null && events.length > 0) {
    frozen.current = {
      first: events[0].at,
      last: events[events.length - 1].at
    };
  }

  const { start, span, buckets, max } = useMemo(() => {
    if (events.length === 0) {
      return { start: 0, span: 1, buckets: [] as Bucket[], max: 0 };
    }
    const first = frozen.current?.first ?? events[0].at;
    const last = frozen.current?.last ?? events[events.length - 1].at;
    // A session shorter than the bucket count would divide by ~0; a nominal
    // span keeps every event inside a valid bucket.
    const width = Math.max(last - first, 1);

    const tally: Bucket[] = Array.from({ length: BUCKETS }, (_, index) => ({
      count: 0,
      types: [],
      warnings: 0,
      from: first + (index / BUCKETS) * width,
      to: first + ((index + 1) / BUCKETS) * width
    }));
    const names: Array<Map<string, number>> = Array.from(
      { length: BUCKETS },
      () => new Map()
    );

    for (const event of events) {
      // Clamp rather than skip: while the axis is frozen, newer events fall
      // past its end, and they belong in the last bucket rather than nowhere.
      const index = Math.min(
        BUCKETS - 1,
        Math.max(0, Math.floor(((event.at - first) / width) * BUCKETS))
      );
      const bucket = tally[index];
      bucket.count += 1;
      if (event.warnings.length > 0) bucket.warnings += 1;
      const seen = names[index];
      seen.set(event.type, (seen.get(event.type) ?? 0) + 1);
    }

    for (const [index, bucket] of tally.entries()) {
      bucket.types = [...names[index].entries()].sort((a, b) => b[1] - a[1]);
    }

    return {
      start: first,
      span: width,
      buckets: tally,
      max: Math.max(...tally.map((bucket) => bucket.count))
    };
  }, [events]);

  const toFraction = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  // The committed selection as fractions, so it can be drawn on the track.
  const selFrom = range.from === null ? null : (range.from - start) / span;
  const selTo = range.to === null ? null : (range.to - start) / span;

  const shadeFrom = draft ? Math.min(draft.from, draft.to) : selFrom;
  const shadeTo = draft ? Math.max(draft.from, draft.to) : selTo;

  const commit = (from: number, to: number): void => {
    const [low, high] = from <= to ? [from, to] : [to, from];
    // A click rather than a drag: clear, instead of selecting a zero-width
    // window that would hide every event.
    if (high - low < MIN_SPAN) {
      onChange({ from: null, to: null });
      return;
    }
    onChange({
      from: Math.round(start + low * span),
      to: Math.round(start + high * span)
    });
  };

  // Pointer capture keeps a drag alive when the cursor leaves the strip, but
  // the pointerup can still land elsewhere; a window listener guarantees the
  // drag always ends rather than sticking.
  useLayoutEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent): void => {
      setDraft((current) =>
        current === null
          ? null
          : drag.kind === `from`
            ? { ...current, from: toFraction(event.clientX) }
            : { ...current, to: toFraction(event.clientX) }
      );
    };
    const up = (event: PointerEvent): void => {
      // Read the draft from a ref rather than inside a `setDraft` updater:
      // calling the parent's `onChange` from within an updater is a setState
      // during another component's render, which React warns about.
      const current = draftRef.current;
      if (current) {
        const at = toFraction(event.clientX);
        commit(
          drag.kind === `from` ? at : current.from,
          drag.kind === `from` ? current.to : at
        );
      }
      setDraft(null);
      setDrag(null);
    };
    window.addEventListener(`pointermove`, move);
    window.addEventListener(`pointerup`, up);
    return (): void => {
      window.removeEventListener(`pointermove`, move);
      window.removeEventListener(`pointerup`, up);
    };
  }, [drag]);

  if (events.length === 0) return null;

  const selected = range.from !== null || range.to !== null;
  const hovered = hover === null ? null : buckets[hover.index];

  const clock = (at: number): string => {
    const date = new Date(at);
    return `${String(date.getHours()).padStart(2, `0`)}:${String(date.getMinutes()).padStart(2, `0`)}:${String(date.getSeconds()).padStart(2, `0`)}`;
  };

  return (
    <section className="shrink-0 border-b border-slate-800 bg-slate-900/30 px-4 py-2">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          Timeline
        </span>
        <span className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="font-mono">
            {clock(start)} – {clock(start + span)}
          </span>
          {selected ? (
            <Button
              onPress={() => {
                onChange({ from: null, to: null });
              }}
              className="rounded px-1.5 py-0.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              Reset range
            </Button>
          ) : null}
        </span>
      </div>

      {/* Pointer events rather than a two-thumb Slider: this is a brush over a
          continuous axis — you drag anywhere on the chart, and the handles are
          edges of the shaded window rather than free-standing thumbs. */}
      <div
        ref={trackRef}
        role="presentation"
        className="relative h-12 cursor-crosshair select-none rounded bg-slate-950/60"
        onPointerDown={(event) => {
          // Handles set their own drag mode in their onPointerDown; reaching
          // here means the press landed on open track, starting a new window.
          const at = toFraction(event.clientX);
          setDraft({ from: at, to: at });
          setDrag({ kind: `new` });
        }}
        onPointerMove={(event) => {
          const rect = trackRef.current?.getBoundingClientRect();
          if (!rect) return;
          const fraction = toFraction(event.clientX);
          setHover({
            index: Math.min(BUCKETS - 1, Math.floor(fraction * BUCKETS)),
            x: event.clientX - rect.left
          });
        }}
        onPointerLeave={() => {
          setHover(null);
        }}
      >
        <div className="flex h-full items-end gap-px px-px">
          {buckets.map((bucket, index) => {
            const inRange =
              shadeFrom === null ||
              shadeTo === null ||
              (index / BUCKETS >= shadeFrom - 1 / BUCKETS &&
                index / BUCKETS <= shadeTo);
            return (
              <div
                key={index}
                className={`flex-1 rounded-t transition-colors ${
                  bucket.count === 0
                    ? `bg-transparent`
                    : bucket.warnings > 0
                      ? inRange
                        ? `bg-amber-400/70`
                        : `bg-amber-400/25`
                      : inRange
                        ? `bg-indigo-400/70`
                        : `bg-indigo-400/25`
                } ${hover?.index === index ? `bg-slate-200/80` : ``}`}
                style={{
                  height:
                    max === 0
                      ? 0
                      : `${Math.max(8, (bucket.count / max) * 100)}%`
                }}
              />
            );
          })}
        </div>

        {shadeFrom !== null && shadeTo !== null ? (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 bg-indigo-400/10"
              style={{
                left: `${shadeFrom * 100}%`,
                width: `${(shadeTo - shadeFrom) * 100}%`
              }}
            />
            {/* Grab handles. `touch-none` stops the browser claiming the
                gesture for scrolling before pointermove fires. */}
            {(
              [
                [`from`, shadeFrom],
                [`to`, shadeTo]
              ] as const
            ).map(([edge, at]) => (
              <div
                key={edge}
                role="slider"
                tabIndex={0}
                aria-label={edge === `from` ? `Range start` : `Range end`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(at * 100)}
                className="absolute inset-y-0 -ml-1.5 w-3 cursor-ew-resize touch-none"
                style={{ left: `${at * 100}%` }}
                onPointerDown={(event) => {
                  // Stop the track handler from starting a brand-new window.
                  event.stopPropagation();
                  setDraft({ from: shadeFrom, to: shadeTo });
                  setDrag({ kind: edge });
                }}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 0.05 : 0.01;
                  const delta =
                    event.key === `ArrowLeft`
                      ? -step
                      : event.key === `ArrowRight`
                        ? step
                        : 0;
                  if (delta === 0) return;
                  event.preventDefault();
                  const next = Math.min(1, Math.max(0, at + delta));
                  commit(
                    edge === `from` ? next : shadeFrom,
                    edge === `from` ? shadeTo : next
                  );
                }}
              >
                <div className="mx-auto h-full w-0.5 bg-indigo-300" />
              </div>
            ))}
          </>
        ) : null}

        {hovered && hovered.count > 0 ? (
          <div
            className="pointer-events-none absolute bottom-full z-10 mb-1 w-max max-w-64 -translate-x-1/2 rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] shadow-lg"
            style={{
              left: `clamp(4rem, ${hover?.x ?? 0}px, calc(100% - 4rem))`
            }}
          >
            <p className="mb-0.5 font-mono text-slate-400">
              {clock(hovered.from)} · {hovered.count} event
              {hovered.count === 1 ? `` : `s`}
            </p>
            {hovered.types.slice(0, 4).map(([type, count]) => (
              <p key={type} className="flex justify-between gap-3 font-mono">
                <span className="text-slate-200">{type}</span>
                <span className="text-slate-500">{count}</span>
              </p>
            ))}
            {hovered.types.length > 4 ? (
              <p className="text-slate-600">
                +{hovered.types.length - 4} more types
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};
