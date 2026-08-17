import { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogTrigger,
  Input,
  Popover,
  SearchField
} from "react-aria-components";
import { Server } from "lucide-react";
import type { InspectedEvent } from "../../shared/protocol.js";

/**
 * Include/exclude events by guild.
 *
 * A bot in many guilds produces a stream where the one server you care about
 * is buried under everything else, and a text filter can't express "not that
 * guild" — the guild id never appears in the event *type*.
 *
 * The list is built from the events already in the buffer rather than fetched:
 * `GUILD_CREATE` arrives for every guild the bot is in, right after `READY`,
 * and carries both `id` and `name`. So the roster is free, always matches the
 * connected bot, and needs no REST call or extra scope.
 *
 * Filtering is a VIEW concern here: hidden events stay in the buffer, so
 * re-including a guild brings its history back immediately rather than
 * starting from empty.
 */

/** Pull a guild id off an event payload, if it carries one. */
export const guildIdOf = (event: InspectedEvent): string | null => {
  const data: unknown = event.data;
  if (typeof data !== `object` || data === null) return null;
  // Wire shape — `onDispatch` delivers Discord's raw snake_case.
  const id: unknown =
    Reflect.get(data, `guild_id`) ??
    // GUILD_CREATE and friends put the guild at the top level, where its own
    // `id` IS the guild id.
    (event.type.startsWith(`GUILD_`) ? Reflect.get(data, `id`) : undefined);
  return typeof id === `string` ? id : null;
};

export interface GuildOption {
  id: string;
  name: string;
  count: number;
}

/** Guilds seen in the buffer, with how many events each produced. */
export const useGuilds = (events: InspectedEvent[]): GuildOption[] =>
  useMemo(() => {
    const names = new Map<string, string>();
    const counts = new Map<string, number>();

    for (const event of events) {
      const id = guildIdOf(event);
      if (id === null) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
      // Only GUILD_CREATE carries the name; everything else is just an id.
      if (event.type === `GUILD_CREATE` && !names.has(id)) {
        const data: unknown = event.data;
        const name =
          typeof data === `object` && data !== null
            ? Reflect.get(data, `name`)
            : undefined;
        if (typeof name === `string`) names.set(id, name);
      }
    }

    return [...counts.entries()]
      .map(([id, count]) => ({
        id,
        // An id is a poor label, but better than dropping a guild we have
        // traffic for but no GUILD_CREATE from (buffer eviction, or a join
        // mid-session).
        name: names.get(id) ?? `Guild ${id.slice(0, 6)}…`,
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

export const GuildFilter = ({
  guilds,
  hidden,
  onToggle,
  onShowAll
}: {
  guilds: GuildOption[];
  hidden: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onShowAll: () => void;
}): React.JSX.Element => {
  const [query, setQuery] = useState(``);
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? guilds.filter(
        (guild) =>
          guild.name.toLowerCase().includes(needle) || guild.id.includes(needle)
      )
    : guilds;

  const hiddenCount = guilds.filter((guild) => hidden.has(guild.id)).length;

  return (
    <DialogTrigger>
      <Button
        isDisabled={guilds.length === 0}
        className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors disabled:opacity-40 ${
          hiddenCount > 0
            ? `bg-indigo-500/15 text-accent`
            : `text-ink-body hover:bg-ink-line hover:text-ink-text`
        }`}
      >
        <Server size={11} aria-hidden />
        {/* Tabular digits and a fixed width: this button anchors the popover,
            so letting the label reflow moved the open panel sideways as you
            toggled guilds inside it. */}
        <span className="w-24 text-left tabular-nums">
          {hiddenCount > 0
            ? `${guilds.length - hiddenCount} of ${guilds.length} guilds`
            : `All guilds`}
        </span>
      </Button>

      <Popover className="rounded border border-ink-line-strong bg-ink-panel shadow-lg">
        <Dialog className="w-72 outline-none">
          <div className="border-b border-ink-line p-2">
            <SearchField
              value={query}
              onChange={setQuery}
              aria-label="Search guilds"
              className="flex items-center gap-2"
            >
              <Input
                placeholder="Search guilds…"
                className="min-w-0 flex-1 rounded border border-ink-line-strong bg-ink-bg px-2 py-1 text-xs text-ink-text placeholder:text-ink-faint focus:border-indigo-500 focus:outline-none"
              />
              <Button
                onPress={onShowAll}
                isDisabled={hiddenCount === 0}
                className="shrink-0 rounded px-1.5 py-0.5 text-2xs text-ink-body hover:bg-ink-line hover:text-ink-text disabled:opacity-40"
              >
                Show all
              </Button>
            </SearchField>
          </div>

          <div className="max-h-72 overflow-y-auto p-1">
            {shown.length === 0 ? (
              <p className="p-3 text-xs text-ink-muted">
                {guilds.length === 0
                  ? `No guild events yet.`
                  : `No guilds match "${query}".`}
              </p>
            ) : (
              shown.map((guild) => (
                <Checkbox
                  key={guild.id}
                  isSelected={!hidden.has(guild.id)}
                  onChange={() => {
                    onToggle(guild.id);
                  }}
                  className="group flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-xs text-ink-body hover:bg-ink-line/60"
                >
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
                  <span className="min-w-0 flex-1 truncate" title={guild.id}>
                    {guild.name}
                  </span>
                  <span className="shrink-0 font-mono text-2xs text-ink-muted">
                    {guild.count}
                  </span>
                </Checkbox>
              ))
            )}
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};
