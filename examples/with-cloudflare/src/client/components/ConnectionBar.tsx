import { useState } from "react";
import {
  Button,
  Disclosure,
  DisclosurePanel,
  Heading,
  Input,
  Label,
  TextField,
  ToggleButton
} from "react-aria-components";
import { GatewayIntents, type GatewayIntentName } from "@discordkit/gateway";
import {
  AlertTriangle,
  ChevronRight,
  Plug,
  PlugZap,
  RefreshCw
} from "lucide-react";
import type { InspectorStatus } from "../../shared/protocol.js";

const PRIVILEGED = new Set<GatewayIntentName>([
  `GUILD_PRESENCES`,
  `GUILD_MEMBERS`,
  `MESSAGE_CONTENT`
]);

/** Sensible starting point: guild events plus message traffic. */
const DEFAULT_INTENTS: GatewayIntentName[] = [
  `GUILDS`,
  `GUILD_MESSAGES`,
  `MESSAGE_CONTENT`
];

const ALL_INTENTS = Object.keys(GatewayIntents) as GatewayIntentName[];

interface ConnectionBarProps {
  status: InspectorStatus;
  online: boolean;
  onConnect: (token: string, intents: readonly GatewayIntentName[]) => void;
  onReconnect: (intents: readonly GatewayIntentName[]) => void;
  onDisconnect: () => void;
}

/** Same members, ignoring order — intents are a set, not a sequence. */
const sameIntents = (
  a: readonly GatewayIntentName[],
  b: readonly GatewayIntentName[]
): boolean => a.length === b.length && a.every((intent) => b.includes(intent));

export const ConnectionBar = ({
  status,
  online,
  onConnect,
  onReconnect,
  onDisconnect
}: ConnectionBarProps): React.JSX.Element => {
  const [token, setToken] = useState(``);
  const [intents, setIntents] = useState<GatewayIntentName[]>(DEFAULT_INTENTS);
  const connected = status.state !== `idle` && status.state !== `closed`;
  // Intents stay editable while connected, but Discord only accepts them in
  // IDENTIFY — so a change is staged until you explicitly apply it, rather
  // than silently costing a session start per toggle.
  const dirty = connected && !sameIntents(intents, status.intents);
  // Surfaced on the collapsed summary: the 4014 close is the single most
  // common way a first connection fails, and folding the chips away must not
  // hide the warning that explains it.
  const privilegedSelected = intents.filter((intent) => PRIVILEGED.has(intent));

  const toggle = (intent: GatewayIntentName): void => {
    setIntents((current) =>
      current.includes(intent)
        ? current.filter((name) => name !== intent)
        : [...current, intent]
    );
  };

  return (
    // `shrink-0` so the bar keeps its natural height inside the flex column
    // rather than being squeezed, and the chip list below is capped + scrollable
    // so 21 intents wrapping on a narrow viewport can't starve the event panes.
    <section className="shrink-0 border-b border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <TextField
          // `min-w-0` rather than `min-w-64`: combined with `flex-1` the old
          // floor meant the field absorbed all remaining width and pushed the
          // Connect button flush against (and past) the viewport edge. It can
          // now shrink, and `basis-64` keeps a sensible default width.
          className="flex min-w-0 flex-1 basis-64 flex-col gap-1"
          value={token}
          onChange={setToken}
          type="password"
          isDisabled={connected}
        >
          <Label className="text-xs font-medium text-slate-400">
            Bot token
            {status.tokenFromEnv ? (
              <span className="ml-2 font-normal text-emerald-400">
                using DISCORD_BOT_TOKEN — type to override
              </span>
            ) : null}
          </Label>
          <Input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            placeholder={
              status.tokenFromEnv
                ? `Loaded from the server`
                : `Never leaves your machine in local dev`
            }
          />
        </TextField>

        {connected ? (
          <>
            {/* Only rendered once the staged intents differ, so the cost of a
                re-IDENTIFY is always a deliberate click rather than a
                side effect of toggling a chip. */}
            {dirty ? (
              <Button
                className="flex shrink-0 items-center gap-2 rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 pressed:bg-amber-700"
                onPress={() => {
                  onReconnect(intents);
                }}
              >
                <RefreshCw size={16} aria-hidden />
                Apply &amp; reconnect
              </Button>
            ) : null}
            <Button
              className="flex shrink-0 items-center gap-2 rounded bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 pressed:bg-rose-700"
              onPress={onDisconnect}
            >
              <PlugZap size={16} aria-hidden />
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            className="flex shrink-0 items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 pressed:bg-indigo-700"
            // A server-side DISCORD_BOT_TOKEN is enough on its own — requiring
            // a typed one made the env var useless, since the field was the
            // only way to supply a token at all.
            isDisabled={
              !online || (token.trim() === `` && !status.tokenFromEnv)
            }
            onPress={() => {
              onConnect(token, intents);
            }}
          >
            <Plug size={16} aria-hidden />
            Connect
          </Button>
        )}
      </div>

      {/* The button is also disabled while the browser's socket to the Worker
          is down, which is otherwise invisible: you type a token, nothing
          happens, and there is no way to tell why. Most often the dev server
          restarted on a different port, or isn't running. */}
      {!online ? (
        <p role="status" className="mt-2 text-xs text-amber-400">
          Not connected to the inspector server, so Connect is disabled. Check
          that <code className="font-mono">vp run dev</code> is running, and
          that this page is open on the port it printed.
        </p>
      ) : null}

      {/* Collapsed by default. 21 chips wrapped to three rows plus a help
          paragraph took roughly a quarter of the viewport permanently, to
          configure something you set once before connecting. The summary line
          keeps the current selection visible while folded, so collapsing costs
          no information. */}
      <Disclosure className="mt-3">
        <Heading level={2}>
          <Button
            slot="trigger"
            className="group flex w-full min-w-0 items-center gap-1.5 rounded px-1 py-1 text-left text-xs text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
          >
            <ChevronRight
              size={14}
              aria-hidden
              className="shrink-0 transition-transform group-expanded:rotate-90"
            />
            <span className="shrink-0 font-medium">Intents</span>
            <span className="truncate font-mono text-[11px] text-slate-500">
              {intents.length === 0 ? `none selected` : intents.join(`, `)}
            </span>
            {dirty ? (
              <span className="ml-auto shrink-0 text-[11px] text-amber-400">
                changed — not applied
              </span>
            ) : privilegedSelected.length > 0 ? (
              <span
                className="ml-auto flex shrink-0 items-center gap-1 text-[11px] text-amber-400"
                title="Privileged intents must be enabled in the Developer Portal"
              >
                <AlertTriangle size={11} aria-hidden />
                {privilegedSelected.length} privileged
              </span>
            ) : null}
          </Button>
        </Heading>

        <DisclosurePanel>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ALL_INTENTS.map((intent) => {
              const selected = intents.includes(intent);
              const privileged = PRIVILEGED.has(intent);
              return (
                <ToggleButton
                  key={intent}
                  isSelected={selected}
                  // Editable while connected. The change is staged, not
                  // applied — see the "Apply & reconnect" button below.
                  onChange={() => {
                    toggle(intent);
                  }}
                  className={`rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors disabled:opacity-50 ${
                    selected
                      ? privileged
                        ? `border-amber-500/60 bg-amber-500/15 text-amber-300`
                        : `border-indigo-500/60 bg-indigo-500/15 text-indigo-300`
                      : `border-slate-700 text-slate-500 hover:border-slate-600`
                  }`}
                >
                  {privileged && selected ? (
                    <AlertTriangle
                      size={10}
                      className="mr-1 inline align-[-1px]"
                      aria-label="Privileged intent"
                    />
                  ) : null}
                  {intent}
                </ToggleButton>
              );
            })}
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Amber intents are{` `}
            <strong className="font-medium text-amber-400">
              privileged
            </strong> —
            they must be enabled in the Developer Portal, or Discord closes the
            connection with <code className="font-mono">4014</code>.
          </p>
        </DisclosurePanel>
      </Disclosure>
    </section>
  );
};
