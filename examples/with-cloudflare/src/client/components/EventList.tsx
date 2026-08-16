import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Button,
  GridList,
  GridListItem,
  ListLayout,
  Virtualizer
} from "react-aria-components";
import type { Key } from "react-aria-components";
import type { InspectedEvent } from "../../shared/protocol.js";

const time = (at: number): string => {
  const date = new Date(at);
  return `${String(date.getMinutes()).padStart(2, `0`)}:${String(date.getSeconds()).padStart(2, `0`)}.${String(date.getMilliseconds()).padStart(3, `0`)}`;
};

/**
 * Row height must be a constant the layout can trust: the virtualizer positions
 * rows from this number without measuring them, so it has to match the rendered
 * height (py-1.5 + text-xs line-height) or scrolling drifts.
 */
const ROW_SIZE = 29;

interface EventListProps {
  /** Events already narrowed by the timeline brush. */
  events: InspectedEvent[];
  /** Unfiltered total, so the list can say how much is being hidden. */
  totalCount: number;
  selectedId: number | null;
  onSelect: (id: number) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  onClear: () => void;
  /**
   * Record/pause + capture-filter controls, rendered above the search row.
   *
   * Passed in rather than constructed here so this component stays a pure
   * view over a list of events — it has no reason to know about the socket
   * that produces them.
   */
  recordControls?: React.ReactNode;
}

export const EventList = ({
  events,
  totalCount,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  onClear,
  recordControls
}: EventListProps): React.JSX.Element => {
  const normalized = filter.trim().toUpperCase();

  const visible = useMemo(
    () =>
      normalized === ``
        ? events
        : events.filter((event) => event.type.includes(normalized)),
    [events, normalized]
  );

  const filtered = visible.length !== totalCount;

  return (
    <div className="flex min-h-0 min-w-0 flex-col border-r border-slate-800">
      {recordControls}
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
          className="shrink-0 rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          Clear
        </Button>
      </div>

      {filtered ? (
        <p className="shrink-0 border-b border-slate-800 px-3 py-1 text-[10px] text-slate-500">
          {visible.length} of {totalCount} events
        </p>
      ) : null}

      {/* The virtualizer renders only the rows in view. A busy guild with
          GUILD_PRESENCES enabled produces thousands of events per minute, and
          mounting a DOM node per event makes selection and scrolling stutter
          well before the buffer cap is reached. */}
      <div className="min-h-0 min-w-0 flex-1">
        <Virtualizer layout={ListLayout} layoutOptions={{ rowSize: ROW_SIZE }}>
          <GridList
            aria-label="Gateway events"
            selectionMode="single"
            selectedKeys={selectedId === null ? [] : [selectedId]}
            onSelectionChange={(keys) => {
              const [first] = [...(keys as Set<Key>)];
              if (typeof first === `number`) onSelect(first);
            }}
            items={visible}
            // The virtualizer needs a real height to compute a window, and
            // `display: block` because it positions rows absolutely.
            className="block size-full overflow-auto outline-none"
            renderEmptyState={() => (
              <p className="p-4 text-xs text-slate-600">
                {totalCount === 0
                  ? `No events yet. Connect to start watching Gateway traffic.`
                  : `No events match this filter.`}
              </p>
            )}
          >
            {(event: InspectedEvent) => (
              <GridListItem
                id={event.id}
                textValue={event.type}
                className="flex min-w-0 cursor-pointer items-center gap-2 border-b border-slate-800/50 px-3 text-xs outline-none selected:bg-indigo-500/15 hover:bg-slate-800/40 focus-visible:bg-slate-800/60"
                style={{ height: ROW_SIZE }}
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
            )}
          </GridList>
        </Virtualizer>
      </div>
    </div>
  );
};
