import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Menu,
  MenuItem,
  Popover,
  Slider,
  SliderThumb,
  SliderTrack
} from "react-aria-components";
import { Eye, EyeOff, GripHorizontal, Minus, Plus, X } from "lucide-react";
import type { InspectedEvent } from "../../shared/protocol.js";

/**
 * A multi-track timeline over the event stream, closer to a non-linear video
 * editor than to Chrome's single-histogram overview: each event type gets its
 * own lane, so "what happened around then" is answerable at a glance rather
 * than requiring you to hover every bar to learn what it contained.
 *
 * Interactions, all standard for this kind of surface:
 *
 * - **Zoom** narrows the visible window (buttons, or Ctrl/Cmd+wheel anchored
 *   on the pointer so whatever is under the cursor stays put).
 * - **Scrollbar** pans the window when zoomed, rather than requiring a
 *   modifier-drag nobody would discover.
 * - **Brush** drags out a selection, which filters the list below.
 * - **Pan** drags an existing selection bodily, keeping its width.
 * - **Resize** drags the panel taller; tracks divide the space evenly, so more
 *   height means more visible detail per lane rather than just more padding.
 */

export interface TimeSelection {
  /** Epoch ms, inclusive. `null` means unbounded on that end. */
  from: number | null;
  to: number | null;
}

/** Buckets across a lane. Fine enough to show bursts, coarse enough to stay legible. */
const BUCKETS = 160;

/** Below this fraction a drag reads as a click, and clears rather than selects. */
const MIN_SPAN = 0.004;

/** Track sizing. Below the minimum, the track area scrolls instead of shrinking. */
const MIN_TRACK_HEIGHT = 12;
const MAX_TRACK_HEIGHT = 48;

/** Panel height bounds, in px, for the resize handle. */
const MIN_PANEL = 64;
const MAX_PANEL = 420;
const DEFAULT_PANEL = 120;

/**
 * Zoom bounds, as a fraction of the session.
 *
 * Below 1x the whole session is squeezed into part of the track, which leaves
 * room for it to grow: a live recording keeps extending to the right, and
 * zooming out is how you keep the newest events in view without the axis
 * rescaling under you on every event.
 *
 * 10x is the ceiling because the buckets are the real resolution limit —
 * past it you are magnifying 160 buckets rather than resolving more detail.
 */
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 10;

/** Gutter, in px, reserved on each side of the track for the range handles. */
const TRACK_GUTTER = 10;

/** Roughly how many ruler ticks to draw; the real count snaps to a nice unit. */
const TARGET_TICKS = 6;

/** Nice round intervals, in ms, for the time ruler. */
const TICK_STEPS = [
  100, 250, 500, 1_000, 2_000, 5_000, 10_000, 15_000, 30_000, 60_000, 120_000,
  300_000, 600_000, 900_000, 1_800_000, 3_600_000
];

/**
 * A stable colour per event type.
 *
 * Hashed from the name rather than assigned by index, so a type keeps its
 * colour as other types come and go — an index-based palette would reshuffle
 * every lane the moment a new event type first appeared.
 */
const laneColor = (type: string): string => {
  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    hash = (hash * 31 + type.charCodeAt(i)) >>> 0;
  }
  // Golden-angle stepping spreads adjacent hashes far apart on the wheel, so
  // similar names (MESSAGE_CREATE / MESSAGE_UPDATE) don't get similar colours.
  const hue = (hash * 137.508) % 360;
  // oklch, not hsl: hsl's lightness is not perceptual, so `hsl(60 70% 58%)`
  // (yellow) is far brighter than `hsl(260 70% 58%)` (blue) at the same stated
  // lightness. Lanes would then read as "important" purely by hue. A fixed
  // oklch L holds every lane at the same perceived brightness.
  return `oklch(0.78 0.13 ${hue.toFixed(0)})`;
};

interface Lane {
  type: string;
  count: number;
  warnings: number;
  /** Per-bucket counts across the visible window. */
  buckets: number[];
  peak: number;
}

type DragKind = `new` | `from` | `to` | `pan`;

interface Drag {
  kind: DragKind;
  /** Pointer fraction where the drag began. */
  originX: number;
  /** Raw pointer x where the drag began, for unclamped pan deltas. */
  originClientX: number;
  originFrom: number;
  originTo: number;
}

const clockOf = (at: number, withMs = false): string => {
  const date = new Date(at);
  const base = `${String(date.getHours()).padStart(2, `0`)}:${String(date.getMinutes()).padStart(2, `0`)}:${String(date.getSeconds()).padStart(2, `0`)}`;
  return withMs
    ? `${base}.${String(date.getMilliseconds()).padStart(3, `0`)}`
    : base;
};

export const TimeRange = ({
  events,
  range,
  onChange,
  controls,
  hiddenTypes,
  onToggleType
}: {
  events: InspectedEvent[];
  range: TimeSelection;
  onChange: (range: TimeSelection) => void;
  /** Record/pause + capture-filter controls, rendered in this panel's header. */
  controls?: React.ReactNode;
  /** Types hidden from the list; their tracks render dimmed. */
  hiddenTypes: ReadonlySet<string>;
  onToggleType: (type: string) => void;
}): React.JSX.Element | null => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [draft, setDraft] = useState<{ from: number; to: number } | null>(null);
  const draftRef = useRef<{ from: number; to: number } | null>(null);
  draftRef.current = draft;
  const [hover, setHover] = useState<{ x: number; at: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);
  const [panelHeight, setPanelHeight] = useState(DEFAULT_PANEL);
  const [resizing, setResizing] = useState<{
    y: number;
    height: number;
  } | null>(null);

  // While a range is selected the axis is FROZEN at the extent it had when the
  // selection was made. Without this the axis keeps growing with each new
  // event, so a fixed epoch-ms window occupies an ever-smaller slice of the
  // strip and appears to drift left.
  const frozen = useRef<{ first: number; last: number } | null>(null);
  const selecting = range.from !== null || range.to !== null;
  if (!selecting) frozen.current = null;
  else if (frozen.current === null && events.length > 0) {
    frozen.current = {
      first: events[0].at,
      last: events[events.length - 1].at
    };
  }

  const { start, span } = useMemo(() => {
    if (events.length === 0) return { start: 0, span: 1 };
    const first = frozen.current?.first ?? events[0].at;
    const last = frozen.current?.last ?? events[events.length - 1].at;
    return { start: first, span: Math.max(last - first, 1) };
  }, [events, selecting]);

  // Below 1x the window is WIDER than the session, so the events occupy only
  // part of the track and the rest is empty space for the recording to grow
  // into. `windowStart` is then pinned at 0 — there is nothing to pan to.
  const windowSpan = 1 / zoom;
  const windowStart =
    windowSpan >= 1 ? 0 : Math.min(Math.max(offset, 0), 1 - windowSpan);

  const lanes = useMemo(() => {
    const byType = new Map<string, Lane>();
    for (const event of events) {
      // Lifecycle markers are separators in the list, not a stream of traffic
      // — giving them lanes would add tracks that fire once and then sit empty.
      if (event.category === `lifecycle`) continue;
      const fraction = (event.at - start) / span;
      const local = (fraction - windowStart) / windowSpan;
      let lane = byType.get(event.type);
      if (!lane) {
        lane = {
          type: event.type,
          count: 0,
          warnings: 0,
          buckets: new Array<number>(BUCKETS).fill(0),
          peak: 0
        };
        byType.set(event.type, lane);
      }
      lane.count += 1;
      if (event.warnings.length > 0) lane.warnings += 1;
      if (local < 0 || local > 1) continue;
      const index = Math.min(BUCKETS - 1, Math.floor(local * BUCKETS));
      lane.buckets[index] += 1;
      if (lane.buckets[index] > lane.peak) lane.peak = lane.buckets[index];
    }
    // Busiest first, so the lanes that matter are visible before scrolling.
    return [...byType.values()].sort((a, b) => b.count - a.count);
  }, [events, start, span, windowStart, windowSpan]);

  /**
   * Tracks divide the panel evenly, so a taller panel means taller bars rather
   * than more empty space — the point of resizing is to read frequency more
   * clearly. Below a legible minimum the area scrolls instead of shrinking.
   */
  const trackHeight = Math.min(
    MAX_TRACK_HEIGHT,
    Math.max(MIN_TRACK_HEIGHT, panelHeight / Math.max(lanes.length, 1))
  );

  const toFraction = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    // Subtract the handle gutter from both ends: bars are laid out inside the
    // padding box, so pointer positions must be measured against that same
    // content width or a click lands ~10px off at each edge.
    const width = rect.width - TRACK_GUTTER * 2;
    if (width <= 0) return 0;
    const local = Math.min(
      1,
      Math.max(0, (clientX - rect.left - TRACK_GUTTER) / width)
    );
    return windowStart + local * windowSpan;
  };

  const toViewport = (fraction: number): number =>
    (fraction - windowStart) / windowSpan;

  const commit = (from: number, to: number): void => {
    const [low, high] = from <= to ? [from, to] : [to, from];
    if (high - low < MIN_SPAN * windowSpan) {
      onChange({ from: null, to: null });
      return;
    }
    onChange({
      from: Math.round(start + low * span),
      to: Math.round(start + high * span)
    });
  };

  useLayoutEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent): void => {
      const at = toFraction(event.clientX);
      setDraft((current) => {
        if (current === null) return null;
        if (drag.kind === `from`) return { ...current, from: at };
        if (drag.kind === `to`) return { ...current, to: at };
        if (drag.kind === `pan`) {
          const width = drag.originTo - drag.originFrom;
          // Raw pointer delta, not the difference of two `toFraction`
          // results — that helper clamps, which would clamp the drag twice.
          const rect = trackRef.current?.getBoundingClientRect();
          const usable = rect ? rect.width - TRACK_GUTTER * 2 : 0;
          const shift =
            usable > 0
              ? ((event.clientX - drag.originClientX) / usable) * windowSpan
              : 0;
          // The selection may sit anywhere in the session, including past
          // the last event where a live recording will extend.
          const from = Math.min(
            Math.max(drag.originFrom + shift, 0),
            Math.max(0, 1 - width)
          );
          return { from, to: from + width };
        }
        return { ...current, to: at };
      });
    };
    const up = (event: PointerEvent): void => {
      const current = draftRef.current;
      if (current) {
        if (drag.kind === `pan`) commit(current.from, current.to);
        else {
          const at = toFraction(event.clientX);
          commit(
            drag.kind === `from` ? at : current.from,
            drag.kind === `from` ? current.to : at
          );
        }
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
  }, [drag, windowStart, windowSpan]);

  // Panel resize, on the window so the pointer can leave the handle mid-drag.
  useLayoutEffect(() => {
    if (!resizing) return;
    const move = (event: PointerEvent): void => {
      setPanelHeight(
        Math.min(
          MAX_PANEL,
          Math.max(MIN_PANEL, resizing.height + (event.clientY - resizing.y))
        )
      );
    };
    const up = (): void => {
      setResizing(null);
    };
    window.addEventListener(`pointermove`, move);
    window.addEventListener(`pointerup`, up);
    return (): void => {
      window.removeEventListener(`pointermove`, move);
      window.removeEventListener(`pointerup`, up);
    };
  }, [resizing]);

  const selFrom = range.from === null ? null : (range.from - start) / span;
  const selTo = range.to === null ? null : (range.to - start) / span;
  const shadeFrom = draft ? Math.min(draft.from, draft.to) : selFrom;
  const shadeTo = draft ? Math.max(draft.from, draft.to) : selTo;

  /** Zoom around a viewport anchor so the point under it stays fixed. */
  const zoomTo = (next: number, anchor = 0.5): void => {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    const focus = windowStart + anchor * windowSpan;
    const nextSpan = 1 / clamped;
    setZoom(clamped);
    setOffset(Math.min(Math.max(focus - anchor * nextSpan, 0), 1 - nextSpan));
  };

  /**
   * Zoom to the most recent burst of activity, so a long idle stretch doesn't
   * squeeze every event into an unclickable sliver.
   *
   * Explicit and undoable rather than an automatic axis crop: cropping would
   * hide events that are still in the buffer.
   */
  const fitToActivity = (): void => {
    if (events.length < 2) return;
    const last = events[events.length - 1].at;
    const gap = span / BUCKETS;
    let begin = events[0].at;
    for (let i = events.length - 1; i > 0; i--) {
      if (events[i].at - events[i - 1].at > gap * 8) {
        begin = events[i].at;
        break;
      }
    }
    const from = Math.max(0, (begin - start) / span - 0.02);
    const to = Math.min(1, (last - start) / span + 0.02);
    const width = Math.max(to - from, 1 / ZOOM_MAX);
    setZoom(Math.min(ZOOM_MAX, 1 / width));
    setOffset(from);
  };

  // Ruler ticks at a round interval, so labels land on readable times rather
  // than arbitrary fractions of the window.
  const ticks = useMemo(() => {
    const visibleMs = span * windowSpan;
    const rough = visibleMs / TARGET_TICKS;
    const step = TICK_STEPS.find((s) => s >= rough) ?? TICK_STEPS.at(-1)!;
    const firstAt = start + windowStart * span;
    const out: Array<{ at: number; left: number }> = [];
    for (
      let at = Math.ceil(firstAt / step) * step;
      at <= firstAt + visibleMs;
      at += step
    ) {
      out.push({ at, left: ((at - firstAt) / visibleMs) * 100 });
    }
    return out;
  }, [start, span, windowStart, windowSpan]);

  if (events.length === 0) return null;

  return (
    <section className="shrink-0 border-b border-ink-line bg-ink-panel/50">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pt-2">
        <span className="text-2xs uppercase tracking-wide text-ink-muted">
          Timeline
        </span>
        {controls}
        <span className="ml-auto flex items-center gap-2 text-2xs text-ink-muted">
          {/* Zoom: -/+ flanking a slider, with the level as a button that opens
              an options menu. Combines the two patterns worth stealing — a
              slider for coarse continuous control, a menu for exact jumps and
              their shortcuts. */}
          <span className="flex items-center gap-1">
            <Button
              onPress={() => {
                zoomTo(zoom / 2);
              }}
              isDisabled={zoom <= ZOOM_MIN}
              aria-label="Zoom out"
              className="rounded p-0.5 text-ink-body hover:bg-ink-line hover:text-ink-text disabled:opacity-30"
            >
              <Minus size={12} aria-hidden />
            </Button>

            <Slider
              // Logarithmic: each unit doubles, so dragging feels even across
              // the whole 25%-1000% range. A linear slider would spend most of
              // its travel at the high end, where the difference between
              // neighbouring values is imperceptible.
              value={Math.log2(zoom)}
              minValue={Math.log2(ZOOM_MIN)}
              maxValue={Math.log2(ZOOM_MAX)}
              step={0.05}
              onChange={(value) => {
                zoomTo(2 ** (typeof value === `number` ? value : value[0]));
              }}
              aria-label="Timeline zoom level"
              className="flex w-24 items-center"
            >
              <SliderTrack className="relative h-1 w-full rounded-full bg-ink-line">
                {({ state }) => (
                  <>
                    <div
                      className="absolute h-1 rounded-full bg-ink-line-strong"
                      style={{ width: `${state.getThumbPercent(0) * 100}%` }}
                    />
                    <SliderThumb className="top-1/2 size-3 rounded-full border border-ink-bg bg-ink-body dragging:bg-ink-text focus-visible:outline-2 focus-visible:outline-accent" />
                  </>
                )}
              </SliderTrack>
            </Slider>

            <DialogTrigger>
              <Button
                aria-label="Zoom options"
                className="w-12 rounded px-1 py-0.5 text-center font-mono tabular-nums hover:bg-ink-line hover:text-ink-text"
              >
                {Math.round(zoom * 100)}%
              </Button>
              <Popover className="rounded border border-ink-line-strong bg-ink-panel py-1 shadow-lg">
                <Dialog className="min-w-48 outline-none">
                  <Menu
                    className="text-2xs outline-none"
                    onAction={(key) => {
                      if (key === `fit`) fitToActivity();
                      else if (key === `clear`)
                        onChange({ from: null, to: null });
                      else if (key === `reset`) {
                        onChange({ from: null, to: null });
                        setZoom(1);
                        setOffset(0);
                      } else if (key === `selection`) {
                        if (selFrom !== null && selTo !== null) {
                          const width = Math.max(selTo - selFrom, 1 / ZOOM_MAX);
                          setZoom(Math.min(ZOOM_MAX, 1 / width));
                          setOffset(selFrom);
                        }
                      } else zoomTo(Number(key));
                    }}
                  >
                    {(
                      [
                        [`0.25`, `25%`, ``],
                        [`0.5`, `50%`, ``],
                        [`1`, `100%`, ``],
                        [`2`, `200%`, ``],
                        [`5`, `500%`, ``],
                        [`10`, `1000%`, ``],
                        [`fit`, `Fit to activity`, ``],
                        [`selection`, `Zoom to selection`, ``],
                        [`clear`, `Clear selection`, ``],
                        [`reset`, `Reset view`, ``]
                      ] as const
                    ).map(([key, text, hint]) => (
                      <MenuItem
                        key={key}
                        id={key}
                        isDisabled={
                          (key === `selection` || key === `clear`) && !selecting
                        }
                        className="flex cursor-default items-center justify-between gap-6 px-3 py-1.5 text-ink-body outline-none focus:bg-accent/20 focus:text-ink-text disabled:opacity-40"
                      >
                        <span>{text}</span>
                        {hint ? (
                          <span className="font-mono text-ink-faint">
                            {hint}
                          </span>
                        ) : null}
                      </MenuItem>
                    ))}
                  </Menu>
                </Dialog>
              </Popover>
            </DialogTrigger>

            <Button
              onPress={() => {
                zoomTo(zoom * 2);
              }}
              isDisabled={zoom >= ZOOM_MAX}
              aria-label="Zoom in"
              className="rounded p-0.5 text-ink-body hover:bg-ink-line hover:text-ink-text disabled:opacity-30"
            >
              <Plus size={12} aria-hidden />
            </Button>
          </span>
          {/* A selection is otherwise only clearable by clicking the track,
              which is not discoverable, and is impossible to guess when the
              selection already covers everything. */}
          {selecting ? (
            <Button
              onPress={() => {
                onChange({ from: null, to: null });
              }}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-ink-body hover:bg-ink-line hover:text-ink-text"
            >
              <X size={11} aria-hidden />
              Clear slice
            </Button>
          ) : null}
          {/* Fixed-width so the readout appearing on hover cannot reflow the
              header — the previous version rendered it conditionally below the
              track, which shifted the whole panel on every mouse-over. */}
          <span className="w-24 text-right font-mono tabular-nums">
            {hover ? clockOf(hover.at, true) : ` `}
          </span>
        </span>
      </div>

      <div className="flex gap-2 px-4 pt-1">
        {/* Lane labels sit outside the dragging surface so they stay readable
            and don't get caught by the brush. */}
        <div
          className="shrink-0 overflow-hidden"
          style={{ height: panelHeight }}
        >
          {lanes.map((lane, index) => {
            const hidden = hiddenTypes.has(lane.type);
            return (
              <div
                key={lane.type}
                className={`flex items-center gap-1 pr-1 font-mono text-2xs leading-none ${
                  index % 2 === 0 ? `` : `bg-ink-panel/60`
                } text-ink-body`}
                style={{ height: trackHeight }}
              >
                {/* Per-track visibility, as in a motion editor's layer list:
                    hiding a track also drops its events from the list below,
                    so the timeline doubles as the filter control. */}
                <Button
                  onPress={() => {
                    onToggleType(lane.type);
                  }}
                  aria-label={`${hidden ? `Show` : `Hide`} ${lane.type}`}
                  aria-pressed={!hidden}
                  className="shrink-0 rounded p-0.5 text-ink-faint hover:bg-ink-line hover:text-ink-body"
                >
                  {hidden ? (
                    <EyeOff size={12} aria-hidden />
                  ) : (
                    <Eye size={12} aria-hidden />
                  )}
                </Button>
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{
                    background: laneColor(lane.type),
                    opacity: hidden ? 0.3 : 1
                  }}
                  aria-hidden
                />
                <span
                  className={`w-28 truncate ${hidden ? `text-ink-faint line-through` : ``}`}
                  title={`${lane.type} — ${lane.count} event${lane.count === 1 ? `` : `s`}`}
                >
                  {lane.type}
                </span>
              </div>
            );
          })}
        </div>

        <div className="min-w-0 flex-1">
          <div
            ref={trackRef}
            role="presentation"
            // `overflow-x-clip` rather than letting it scroll: the range
            // handles are centred on their edge with a negative margin, so at
            // 0% and 100% they extend past the track and would otherwise
            // summon a horizontal scrollbar over the whole panel. Clipping is
            // right here because there is nothing to reach horizontally —
            // panning is the scrollbar's job.
            className="relative cursor-crosshair select-none overflow-y-auto overflow-x-clip rounded bg-ink-track"
            // Horizontal padding reserves a gutter for the range handles, so a
            // selection covering the whole session does not bury the first and
            // last events under them. Bars are positioned inside this box, so
            // the padding shrinks their area rather than overlapping it.
            style={{
              height: panelHeight,
              paddingInline: TRACK_GUTTER
            }}
            onPointerDown={(event) => {
              const at = toFraction(event.clientX);
              const inside =
                shadeFrom !== null &&
                shadeTo !== null &&
                at >= shadeFrom &&
                at <= shadeTo;
              if (inside && shadeFrom !== null && shadeTo !== null) {
                setDraft({ from: shadeFrom, to: shadeTo });
                setDrag({
                  kind: `pan`,
                  originX: at,
                  originClientX: event.clientX,
                  originFrom: shadeFrom,
                  originTo: shadeTo
                });
              } else {
                setDraft({ from: at, to: at });
                setDrag({
                  kind: `new`,
                  originX: at,
                  originClientX: event.clientX,
                  originFrom: at,
                  originTo: at
                });
              }
            }}
            onPointerMove={(event) => {
              const rect = trackRef.current?.getBoundingClientRect();
              if (!rect) return;
              setHover({
                x: event.clientX - rect.left,
                at: start + toFraction(event.clientX) * span
              });
            }}
            onPointerLeave={() => {
              setHover(null);
            }}
            onWheel={(event) => {
              const rect = trackRef.current?.getBoundingClientRect();
              if (!rect) return;
              if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                const anchor = (event.clientX - rect.left) / rect.width;
                zoomTo(zoom * (event.deltaY < 0 ? 1.25 : 0.8), anchor);
              }
            }}
          >
            {/* Ruler gridlines, behind the bars. */}
            {ticks.map((tick) => (
              <div
                key={tick.at}
                className="pointer-events-none absolute inset-y-0 w-px bg-ink-line/70"
                style={{ left: `${tick.left}%` }}
                aria-hidden
              />
            ))}

            {lanes.map((lane, index) => {
              const hidden = hiddenTypes.has(lane.type);
              return (
                <div
                  key={lane.type}
                  className={`relative ${index % 2 === 0 ? `` : `bg-ink-panel/60`}`}
                  style={{ height: trackHeight }}
                >
                  {lane.buckets.map((count, bucket) =>
                    count === 0 ? null : (
                      <div
                        key={bucket}
                        className="absolute bottom-0 rounded-[1px]"
                        style={{
                          left: `${(bucket / BUCKETS) * 100}%`,
                          width: `${100 / BUCKETS}%`,
                          // Density within the lane, so a burst reads
                          // differently from a steady trickle.
                          height: `${Math.max(25, (count / lane.peak) * 100)}%`,
                          background: laneColor(lane.type),
                          // Hidden tracks stay visible but recede: you still
                          // see that traffic is arriving, which is why you
                          // might want to unhide it.
                          opacity: hidden ? 0.18 : lane.warnings > 0 ? 1 : 0.85
                        }}
                      />
                    )
                  )}
                </div>
              );
            })}

            {shadeFrom !== null && shadeTo !== null ? (
              <>
                <div
                  className="pointer-events-none absolute inset-y-0 bg-indigo-400/10"
                  style={{
                    left: `${toViewport(shadeFrom) * 100}%`,
                    width: `${(toViewport(shadeTo) - toViewport(shadeFrom)) * 100}%`
                  }}
                />
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
                    className="group absolute inset-y-0 z-10 w-4 cursor-ew-resize touch-none"
                    // Centred on its edge, but nudged inward at the extremes
                    // so a handle at 0% or 100% stays fully on-track instead
                    // of being half-clipped by the container.
                    // Centred on its edge. The track's gutter means even a
                    // 0%/100% handle sits over empty space rather than data.
                    style={{
                      left: `calc(${toViewport(at) * 100}% - 8px)`
                    }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      setDraft({ from: shadeFrom, to: shadeTo });
                      setDrag({
                        kind: edge,
                        originX: at,
                        originClientX: event.clientX,
                        originFrom: shadeFrom,
                        originTo: shadeTo
                      });
                    }}
                    onKeyDown={(event) => {
                      const step = (event.shiftKey ? 0.05 : 0.01) * windowSpan;
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
                    <div className="mx-auto flex h-full w-1 items-center justify-center rounded-full bg-indigo-400 group-hover:bg-indigo-300">
                      <span className="h-3 w-px bg-ink-panel" aria-hidden />
                    </div>
                  </div>
                ))}
              </>
            ) : null}

            {hover ? (
              <div
                className="pointer-events-none absolute inset-y-0 w-px bg-ink-faint/50"
                style={{ left: hover.x }}
              />
            ) : null}
          </div>

          {/* Ruler labels, below the track so they can't overlap the bars. */}
          <div className="relative h-3.5">
            {ticks.map((tick) => (
              <span
                key={tick.at}
                // Clamped at the extremes: a label centred on 100% would
                // extend past the track and be clipped.
                className="absolute font-mono text-2xs leading-none text-ink-muted"
                style={{
                  left: `clamp(0px, calc(${tick.left}% - 2rem), calc(100% - 4rem))`,
                  width: `4rem`,
                  textAlign:
                    tick.left < 5 ? `left` : tick.left > 95 ? `right` : `center`
                }}
              >
                {clockOf(tick.at)}
              </span>
            ))}
          </div>

          {/* A real scrollbar for panning when zoomed. A modifier-drag is not
              discoverable; a thumb whose width shows how much of the session
              is visible is self-explanatory. */}
          {zoom > 1 ? (
            <div
              role="scrollbar"
              aria-controls="timeline-track"
              aria-orientation="horizontal"
              aria-valuenow={Math.round(windowStart * 100)}
              tabIndex={0}
              className="relative mt-0.5 h-2 cursor-grab rounded-full bg-ink-line/60"
              onPointerDown={(event) => {
                const rail = event.currentTarget.getBoundingClientRect();
                const grabAt = (event.clientX - rail.left) / rail.width;
                // Centre the window on the click, then let the move handler
                // track the pointer for a normal drag.
                const startOffset = Math.min(
                  Math.max(grabAt - windowSpan / 2, 0),
                  1 - windowSpan
                );
                setOffset(startOffset);
                const move = (moveEvent: PointerEvent): void => {
                  const at = (moveEvent.clientX - rail.left) / rail.width;
                  setOffset(
                    Math.min(Math.max(at - windowSpan / 2, 0), 1 - windowSpan)
                  );
                };
                const up = (): void => {
                  window.removeEventListener(`pointermove`, move);
                  window.removeEventListener(`pointerup`, up);
                };
                window.addEventListener(`pointermove`, move);
                window.addEventListener(`pointerup`, up);
              }}
              onKeyDown={(event) => {
                const step = windowSpan * (event.shiftKey ? 0.5 : 0.1);
                const delta =
                  event.key === `ArrowLeft`
                    ? -step
                    : event.key === `ArrowRight`
                      ? step
                      : 0;
                if (delta === 0) return;
                event.preventDefault();
                setOffset((current) =>
                  Math.min(Math.max(current + delta, 0), 1 - windowSpan)
                );
              }}
            >
              <div
                className="absolute inset-y-0 rounded-full bg-ink-line-strong hover:bg-ink-faint"
                style={{
                  left: `${windowStart * 100}%`,
                  width: `${windowSpan * 100}%`
                }}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Resize handle. Full width so it reads as a panel edge rather than a
          stray control. */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize timeline"
        tabIndex={0}
        className="group flex h-2.5 cursor-ns-resize items-center justify-center hover:bg-ink-line/40"
        onPointerDown={(event) => {
          setResizing({ y: event.clientY, height: panelHeight });
        }}
        onKeyDown={(event) => {
          const delta =
            event.key === `ArrowUp` ? -16 : event.key === `ArrowDown` ? 16 : 0;
          if (delta === 0) return;
          event.preventDefault();
          setPanelHeight((current) =>
            Math.min(MAX_PANEL, Math.max(MIN_PANEL, current + delta))
          );
        }}
      >
        <GripHorizontal
          size={12}
          className="text-ink-faint group-hover:text-ink-muted"
          aria-hidden
        />
      </div>
    </section>
  );
};
