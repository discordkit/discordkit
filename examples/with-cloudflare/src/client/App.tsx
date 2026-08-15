import { useState } from "react";
import { ConnectionBar } from "./components/ConnectionBar.js";
import { EventList } from "./components/EventList.js";
import { PayloadPanel } from "./components/PayloadPanel.js";
import { StatusStrip } from "./components/StatusStrip.js";
import { useInspector } from "./useInspector.js";

export const App = (): React.JSX.Element => {
  const { status, events, error, online, connect, disconnect, clear } =
    useInspector();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState(``);
  const [raw, setRaw] = useState(false);

  const selected = events.find((event) => event.id === selectedId) ?? null;

  return (
    // `h-full` off the html/body chain (see styles.css) rather than a viewport
    // unit here. `h-dvh` left a gap below the UI when the resolved unit
    // disagreed with the real viewport, and `min-h-dvh` silently compiled to
    // nothing — a class that looked right and did nothing.
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="flex shrink-0 items-baseline gap-3 border-b border-slate-800 px-4 py-3">
        <h1 className="text-sm font-semibold">Gateway Event Inspector</h1>
        <p className="text-xs text-slate-500">
          DevTools for the Discord Gateway
        </p>
      </header>

      <ConnectionBar
        status={status}
        online={online}
        onConnect={connect}
        onDisconnect={disconnect}
      />
      <StatusStrip status={status} eventCount={events.length} />

      {error ? (
        <p
          role="alert"
          className="border-b border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300"
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
          events={events}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filter={filter}
          onFilterChange={setFilter}
          onClear={() => {
            clear();
            setSelectedId(null);
          }}
        />
        <PayloadPanel event={selected} raw={raw} onToggleRaw={setRaw} />
      </main>
    </div>
  );
};
