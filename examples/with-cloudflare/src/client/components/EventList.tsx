import { AlertTriangle } from "lucide-react";
import { Button, GridList, GridListItem } from "react-aria-components";
import type { Key } from "react-aria-components";
import type { InspectedEvent } from "../../shared/protocol.js";

const time = (at: number): string => {
  const date = new Date(at);
  return `${String(date.getMinutes()).padStart(2, `0`)}:${String(date.getSeconds()).padStart(2, `0`)}.${String(date.getMilliseconds()).padStart(3, `0`)}`;
};

interface EventListProps {
  events: InspectedEvent[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  onClear: () => void;
}

export const EventList = ({
  events,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  onClear
}: EventListProps): React.JSX.Element => {
  const normalized = filter.trim().toUpperCase();
  const visible =
    normalized === ``
      ? events
      : events.filter((event) => event.type.includes(normalized));

  return (
    <div className="flex min-h-0 flex-col border-r border-slate-800">
      <div className="flex items-center gap-2 border-b border-slate-800 p-2">
        <input
          value={filter}
          onChange={(event) => {
            onFilterChange(event.target.value);
          }}
          placeholder="Filter events…"
          aria-label="Filter events"
          className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
        />
        <Button
          onPress={onClear}
          className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          Clear
        </Button>
      </div>

      <GridList
        aria-label="Gateway events"
        selectionMode="single"
        selectedKeys={selectedId === null ? [] : [selectedId]}
        onSelectionChange={(keys) => {
          const [first] = [...(keys as Set<Key>)];
          if (typeof first === `number`) onSelect(first);
        }}
        className="min-h-0 flex-1 overflow-y-auto"
        renderEmptyState={() => (
          <p className="p-4 text-xs text-slate-600">
            {events.length === 0
              ? `No events yet. Connect to start watching Gateway traffic.`
              : `No events match this filter.`}
          </p>
        )}
      >
        {visible.map((event) => (
          <GridListItem
            key={event.id}
            id={event.id}
            textValue={event.type}
            className="flex cursor-pointer items-center gap-2 border-b border-slate-800/50 px-3 py-1.5 text-xs outline-none selected:bg-indigo-500/15 hover:bg-slate-800/40 focus-visible:bg-slate-800/60"
          >
            {event.warnings.length > 0 ? (
              <AlertTriangle
                size={12}
                className="shrink-0 text-amber-400"
                aria-label="Has a warning"
              />
            ) : (
              <span className="size-3 shrink-0" aria-hidden />
            )}
            <span className="min-w-0 flex-1 truncate font-mono text-slate-200">
              {event.type}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-slate-600">
              {time(event.at)}
            </span>
          </GridListItem>
        ))}
      </GridList>
    </div>
  );
};
