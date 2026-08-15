import { useState } from "react";
import {
  Button,
  Input,
  Label,
  TextField,
  ToggleButton
} from "react-aria-components";
import { GatewayIntents, type GatewayIntentName } from "@discordkit/gateway";
import { AlertTriangle, Plug, PlugZap } from "lucide-react";
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
  onDisconnect: () => void;
}

export const ConnectionBar = ({
  status,
  online,
  onConnect,
  onDisconnect
}: ConnectionBarProps): React.JSX.Element => {
  const [token, setToken] = useState(``);
  const [intents, setIntents] = useState<GatewayIntentName[]>(DEFAULT_INTENTS);
  const connected = status.state !== `idle` && status.state !== `closed`;

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
          </Label>
          <Input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            placeholder="Never leaves your machine in local dev"
          />
        </TextField>

        {connected ? (
          <Button
            className="flex shrink-0 items-center gap-2 rounded bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 pressed:bg-rose-700"
            onPress={onDisconnect}
          >
            <PlugZap size={16} aria-hidden />
            Disconnect
          </Button>
        ) : (
          <Button
            className="flex shrink-0 items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 pressed:bg-indigo-700"
            isDisabled={!online || token.trim() === ``}
            onPress={() => {
              onConnect(token, intents);
            }}
          >
            <Plug size={16} aria-hidden />
            Connect
          </Button>
        )}
      </div>

      <div className="mt-3 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
        {ALL_INTENTS.map((intent) => {
          const selected = intents.includes(intent);
          const privileged = PRIVILEGED.has(intent);
          return (
            <ToggleButton
              key={intent}
              isSelected={selected}
              isDisabled={connected}
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
        <strong className="font-medium text-amber-400">privileged</strong> —
        they must be enabled in the Developer Portal, or Discord closes the
        connection with <code className="font-mono">4014</code>.
      </p>
    </section>
  );
};
