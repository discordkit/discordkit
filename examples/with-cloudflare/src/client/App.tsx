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
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex items-baseline gap-3 border-b border-slate-800 px-4 py-3">
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
      <StatusStrip status={status} />

      {error ? (
        <p
          role="alert"
          className="border-b border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300"
        >
          {error}
        </p>
      ) : null}

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(220px,320px)_1fr]">
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
