import { useMemo, useState } from "react";
import { ConnectionBar } from "./components/ConnectionBar.js";
import { EventList } from "./components/EventList.js";
import { TimeRange, type TimeSelection } from "./components/TimeRange.js";
import { PayloadPanel } from "./components/PayloadPanel.js";
import { GuildFilter, guildIdOf, useGuilds } from "./components/GuildFilter.js";
import { RecordControls } from "./components/RecordControls.js";
import { StatusStrip } from "./components/StatusStrip.js";
import { useInspector } from "./useInspector.js";

export const App = (): React.JSX.Element => {
  const {
    status,
    events,
    error,
    online,
    connect,
    reconnect,
    disconnect,
    setRecording,
    setRecordFilter,
    clear
  } = useInspector();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState(``);
  const [raw, setRaw] = useState(false);
  const [range, setRange] = useState<TimeSelection>({ from: null, to: null });
  // Event types hidden via the timeline's per-track eye toggles. Purely a view
  // concern — unlike the capture filter, hidden events stay in the buffer, so
  // unhiding brings their history back rather than starting from empty.
  const [hiddenTypes, setHiddenTypes] = useState<ReadonlySet<string>>(
    new Set()
  );
  // Guilds excluded from the view. Like `hiddenTypes`, this hides rather than
  // drops: the events stay buffered, so re-including a guild restores its
  // history instead of starting from empty.
  const [hiddenGuilds, setHiddenGuilds] = useState<ReadonlySet<string>>(
    new Set()
  );
  const guilds = useGuilds(events);

  const selected = events.find((event) => event.id === selectedId) ?? null;

  const isHiddenGuild = (event: (typeof events)[number]): boolean => {
    const id = guildIdOf(event);
    return id !== null && hiddenGuilds.has(id);
  };

  // The brush narrows what the list shows. Applied here rather than inside the
  // list because the timeline spans the full window, above both panes.
  const inRange = useMemo(
    () =>
      events.filter(
        (event) =>
          (range.from === null || event.at >= range.from) &&
          (range.to === null || event.at <= range.to) &&
          !hiddenTypes.has(event.type) &&
          // Events with no guild (READY, lifecycle markers, DMs) are never
          // hidden by a guild filter — they don't belong to one, and dropping
          // them would remove the separators that explain the stream.
          !isHiddenGuild(event)
      ),
    [events, range.from, range.to, hiddenTypes, hiddenGuilds]
  );

  return (
    // `h-full` off the html/body chain (see styles.css) rather than a viewport
    // unit here. `h-dvh` left a gap below the UI when the resolved unit
    // disagreed with the real viewport, and `min-h-dvh` silently compiled to
    // nothing — a class that looked right and did nothing.
    <div className="flex h-full flex-col overflow-hidden bg-ink-bg text-ink-text">
      {/* Title and connection controls share one row: the controls are
          configured once and then ignored, so giving them a band of their own
          spent vertical space on something you stop looking at. */}
      <header className="flex shrink-0 items-center gap-3 border-b border-ink-line px-4 py-2">
        <h1 className="shrink-0 text-sm font-semibold">
          Gateway Event Inspector
        </h1>
        {/* Hidden below 1520px, which is the measured width where the header
            still fits on one row with it shown. A nominal breakpoint (`xl`,
            or 1440) turned it on slightly too early and wrapped the row. */}
        <p className="hidden shrink text-xs text-ink-muted min-[1520px]:block">
          DevTools for the Discord Gateway
        </p>
        <ConnectionBar
          status={status}
          online={online}
          onConnect={connect}
          onReconnect={reconnect}
          onDisconnect={disconnect}
        />
      </header>
      <StatusStrip status={status} eventCount={events.length} />
      {/* Record/pause and the capture filter live in the timeline's header:
          both decide what lands on the tracks, so they belong with the tracks
          rather than above the list. */}
      <TimeRange
        events={events}
        range={range}
        onChange={setRange}
        controls={
          <>
            <RecordControls
              status={status}
              onRecordingChange={setRecording}
              onFilterChange={setRecordFilter}
            />
            <GuildFilter
              guilds={guilds}
              hidden={hiddenGuilds}
              onToggle={(id) => {
                setHiddenGuilds((current) =>
                  current.symmetricDifference(new Set([id]))
                );
              }}
              onShowAll={() => {
                setHiddenGuilds(new Set());
              }}
            />
          </>
        }
        hiddenTypes={hiddenTypes}
        onToggleType={(type) => {
          setHiddenTypes((current) =>
            current.symmetricDifference(new Set([type]))
          );
        }}
      />

      {error ? (
        <p
          role="alert"
          className="border-b border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-danger"
        >
          {error}
        </p>
      ) : null}

      {/* Two sizing details, both load-bearing:
          - The payload column is `minmax(0,1fr)`, not `1fr`. A bare `1fr` track
            floors at `min-content`, so the JSON viewer's longest line would set
            the column width and drag the page into a horizontal scroll.
          - The list column's max is `clamp`ed rather than a flat 320px, so it
            yields on narrow viewports instead of squeezing the payload panel
            down to ~100px. The payload is what you're reading; the list is
            navigation. */}
      <main className="grid min-h-0 flex-1 grid-cols-[minmax(180px,clamp(180px,32vw,320px))_minmax(0,1fr)]">
        <EventList
          events={inRange}
          totalCount={events.length}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filter={filter}
          onFilterChange={setFilter}
          onClear={() => {
            clear();
            setSelectedId(null);
            // Clearing the buffer invalidates the timeline the range was drawn
            // against, so a stale window would silently hide incoming events.
            setRange({ from: null, to: null });
          }}
        />
        <PayloadPanel event={selected} raw={raw} onToggleRaw={setRaw} />
      </main>
    </div>
  );
};
