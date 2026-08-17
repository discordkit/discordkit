import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Input,
  Label,
  Popover,
  TextField,
  ToggleButton
} from "react-aria-components";
import { GatewayIntents, type GatewayIntentName } from "@discordkit/gateway";
import {
  AlertTriangle,
  ExternalLink,
  Plug,
  PlugZap,
  RefreshCw,
  Sliders
} from "lucide-react";
import type { InspectorStatus } from "../../shared/protocol.js";

const PRIVILEGED = new Set<GatewayIntentName>([
  `GUILD_PRESENCES`,
  `GUILD_MEMBERS`,
  `MESSAGE_CONTENT`
]);

/** Sensible starting point: guild events plus message traffic. */
const DEFAULT_INTENTS = new Set<GatewayIntentName>([
  `GUILDS`,
  `GUILD_MESSAGES`,
  `MESSAGE_CONTENT`
]);

const ALL_INTENTS = new Set(Object.keys(GatewayIntents) as GatewayIntentName[]);

/**
 * The two groups, derived from `PRIVILEGED` rather than hand-listed, so a new
 * intent in the generated `GatewayIntents` can't silently go missing from the
 * UI — it lands in the standard group and is at least visible.
 */
const STANDARD_INTENTS = ALL_INTENTS.difference(PRIVILEGED);
const PRIVILEGED_ORDER = ALL_INTENTS.intersection(PRIVILEGED);

/**
 * Intents that do nothing on their own.
 *
 * Intents have no dependencies on each other in general — each gates its own
 * events independently. `MESSAGE_CONTENT` is the exception that looks like one:
 * it gates no EVENT at all, it decides whether `content`/`embeds`/`attachments`
 * are populated on message events you are already receiving. Selected without a
 * message intent, it silently does nothing, which is a confusing way to spend a
 * privileged intent.
 */
const REQUIRES: Partial<Record<GatewayIntentName, GatewayIntentName[]>> = {
  MESSAGE_CONTENT: [`GUILD_MESSAGES`, `DIRECT_MESSAGES`]
};

const IntentChip = ({
  intent,
  isSelected,
  privileged,
  /**
   * For privileged intents: whether the Developer Portal actually grants it.
   * `null` means unknown (application not fetched yet), which renders neutrally
   * rather than accusing a correct setup of being broken.
   */
  granted,
  onToggle
}: {
  intent: GatewayIntentName;
  isSelected: boolean;
  privileged: boolean;
  granted?: boolean | null;
  onToggle: (intent: GatewayIntentName) => void;
}): React.JSX.Element => (
  <ToggleButton
    isSelected={isSelected}
    // Editable while connected. The change is staged, not applied — see the
    // "Apply & reconnect" button above.
    onChange={() => {
      onToggle(intent);
    }}
    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-2xs transition-colors ${
      isSelected
        ? privileged
          ? granted === false
            ? // Selected but NOT enabled in the portal: this exact combination
              // is what Discord closes with 4014, so it gets the error colour
              // rather than the generic privileged amber.
              `border-rose-500/60 bg-rose-500/15 text-danger hover:bg-rose-500/25`
            : `border-amber-500/60 bg-amber-500/15 text-warn hover:bg-amber-500/25`
          : `border-indigo-500/60 bg-indigo-500/15 text-accent hover:bg-indigo-500/25`
        : `border-ink-line-strong text-ink-muted hover:border-accent/60 hover:bg-ink-line hover:text-ink-body`
    }`}
  >
    {privileged && isSelected && granted === false ? (
      <AlertTriangle
        size={10}
        aria-label="Not enabled in the Developer Portal"
      />
    ) : null}
    {intent}
  </ToggleButton>
);

interface ConnectionBarProps {
  status: InspectorStatus;
  online: boolean;
  onConnect: (token: string, intents: readonly GatewayIntentName[]) => void;
  onReconnect: (intents: readonly GatewayIntentName[]) => void;
  onDisconnect: () => void;
}

export const ConnectionBar = ({
  status,
  online,
  onConnect,
  onReconnect,
  onDisconnect
}: ConnectionBarProps): React.JSX.Element => {
  const [token, setToken] = useState(``);
  // A Set, because intents genuinely are one: membership is all that matters,
  // duplicates are meaningless, and the wire format ORs them into a bitfield
  // where order cannot survive anyway.
  //
  // `null` means "not touched since the server last told us what it is". The
  // server's intents are the source of truth for a live connection, so a page
  // refresh adopts them rather than snapping back to DEFAULT_INTENTS — which
  // previously showed the wrong selection AND a spurious "changed — not
  // applied", since the stale defaults differed from what was actually
  // identified.
  const [staged, setStaged] = useState<ReadonlySet<GatewayIntentName> | null>(
    null
  );
  const connected = status.state !== `idle` && status.state !== `closed`;
  const intents =
    staged ??
    (status.intents.length > 0 ? new Set(status.intents) : DEFAULT_INTENTS);
  // Intents stay editable while connected, but Discord only accepts them in
  // IDENTIFY — so a change is staged until you explicitly apply it, rather
  // than silently costing a session start per toggle.
  //
  // `symmetricDifference` is the natural spelling of "do these differ at all":
  // empty means identical, and it needs no length check or manual scan.
  const dirty =
    connected && intents.symmetricDifference(new Set(status.intents)).size > 0;
  // Surfaced on the collapsed summary: the 4014 close is the single most
  // common way a first connection fails, and folding the chips away must not
  // hide the warning that explains it.
  const privilegedSelected = intents.intersection(PRIVILEGED);
  // Intents selected that need a companion intent to have any effect. See
  // REQUIRES: this is about MESSAGE_CONTENT gating FIELDS rather than events.
  const inert = [...intents].filter((intent) => {
    const needs = REQUIRES[intent];
    return needs !== undefined && !needs.some((dep) => intents.has(dep));
  });

  const toggle = (intent: GatewayIntentName): void => {
    // Seeds from the effective set on first edit, so toggling one chip after a
    // refresh doesn't discard the other server-side intents.
    setStaged((current) =>
      (current ?? intents).symmetricDifference(new Set([intent]))
    );
  };

  return (
    // A row segment, not a band: these controls live inside the app header
    // (see App.tsx) because they are configured once and then ignored, and a
    // dedicated strip spent ~120px of permanent height on them.
    <>
      {/* Fixed width, sized for BOTH buttons. "Apply & reconnect" appears only
          when intents are staged, and letting the row reflow at that moment
          shifted every control beside it — including the one you were about to
          click. */}
      <div className="ml-auto flex w-[19.5rem] shrink-0 items-center justify-end gap-2">
        {connected ? (
          <>
            {dirty ? (
              <Button
                className="flex items-center gap-1.5 rounded bg-amber-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-500 pressed:bg-amber-700"
                onPress={() => {
                  onReconnect([...intents]);
                  // Hand authority back to the server: once it re-identifies,
                  // `status.intents` is the truth again.
                  setStaged(null);
                }}
              >
                <RefreshCw size={13} aria-hidden />
                Apply &amp; reconnect
              </Button>
            ) : null}
            <Button
              className="flex items-center gap-1.5 rounded bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-500 pressed:bg-rose-700"
              onPress={onDisconnect}
            >
              <PlugZap size={13} aria-hidden />
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            className="flex items-center gap-1.5 rounded bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-40 pressed:bg-indigo-700"
            // A server-side DISCORD_BOT_TOKEN is enough on its own — requiring
            // a typed one made the env var useless, since the field was the
            // only way to supply a token at all.
            isDisabled={
              !online || (token.trim() === `` && !status.tokenFromEnv)
            }
            onPress={() => {
              onConnect(token, [...intents]);
            }}
          >
            <Plug size={13} aria-hidden />
            Connect
          </Button>
        )}
      </div>

      <TextField
        className="flex min-w-0 shrink items-center gap-2"
        value={token}
        onChange={setToken}
        type="password"
        isDisabled={connected}
      >
        <Label className="shrink-0 text-xs font-medium text-ink-body">
          Token
        </Label>
        <Input
          className="w-[74ch] min-w-0 max-w-full rounded border border-ink-line-strong bg-ink-bg px-2 py-1 font-mono text-xs text-ink-text placeholder:text-ink-faint focus:border-indigo-500 focus:outline-none disabled:opacity-50"
          placeholder={
            status.tokenFromEnv
              ? `Using DISCORD_BOT_TOKEN — type to override`
              : `Never leaves your machine in local dev`
          }
        />
      </TextField>

      {/* Intents move into a popover: 21 chips plus the privileged panel is a
          lot of resident surface for something configured once, and it does
          not need to be visible to be reachable. */}
      <DialogTrigger>
        <Button
          className={`flex shrink-0 items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors ${
            dirty
              ? `border-amber-500/60 bg-amber-500/10 text-warn`
              : `border-ink-line-strong text-ink-body hover:bg-ink-line hover:text-ink-text`
          }`}
        >
          <Sliders size={12} aria-hidden />
          <span className="tabular-nums">{intents.size}</span>
          <span className="text-ink-muted">intents</span>
          {/* Reserved rather than conditional: letting "changed" grow the
              button moved the button itself, which is the shift this layout
              exists to avoid. */}
          <span className="w-16 text-left text-warn">
            {dirty ? `• changed` : ``}
          </span>
          <AlertTriangle
            size={11}
            className={`text-warn ${privilegedSelected.size > 0 ? `` : `invisible`}`}
            aria-hidden
          />
        </Button>

        <Popover className="rounded border border-ink-line-strong bg-ink-panel shadow-lg">
          <Dialog className="w-[44rem] max-w-[92vw] p-3 outline-none">
            <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Heading
                slot="title"
                className="shrink-0 text-xs font-medium text-ink-text"
              >
                Gateway intents
              </Heading>
              {/* Wraps to its own line rather than being squeezed against the
                  heading: `justify-between` on a fixed-width popover pushed
                  this into the title at narrow widths. */}
              <span className="text-2xs text-ink-muted">
                Applied on connect — changing them re-IDENTIFYs
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[...STANDARD_INTENTS].map((intent) => (
                <IntentChip
                  key={intent}
                  intent={intent}
                  isSelected={intents.has(intent)}
                  privileged={false}
                  onToggle={toggle}
                />
              ))}
            </div>

            <div className="mt-3 rounded border border-amber-500/25 bg-amber-500/5 p-2.5">
              <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="flex items-center gap-1.5 text-2xs font-medium text-warn">
                  <AlertTriangle size={11} aria-hidden />
                  Privileged
                </span>
                <span className="min-w-0 text-2xs text-ink-muted">
                  must be enabled in the Developer Portal, or Discord closes
                  with <code className="font-mono">4014</code>
                </span>
                {/* Deep-links to this bot's Bot tab once the application has
                    been fetched; the app picker until then, since without an
                    id there is nothing to link to. */}
                <a
                  href={
                    status.application
                      ? `https://discord.com/developers/applications/${status.application.id}/bot`
                      : `https://discord.com/developers/applications`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-2xs text-warn underline decoration-amber-500/40 underline-offset-2 hover:bg-amber-500/10 hover:decoration-amber-400"
                >
                  Open Developer Portal
                  <ExternalLink size={10} aria-hidden />
                </a>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[...PRIVILEGED_ORDER].map((intent) => (
                  <IntentChip
                    key={intent}
                    intent={intent}
                    isSelected={intents.has(intent)}
                    privileged
                    granted={
                      status.application === null
                        ? null
                        : status.application.enabledPrivileged.includes(intent)
                    }
                    onToggle={toggle}
                  />
                ))}
              </div>

              {inert.length > 0 ? (
                <p className="mt-2 text-xs text-warn">
                  <span className="font-mono">{inert.join(`, `)}</span> gates
                  message FIELDS, not events — without{` `}
                  <span className="font-mono">GUILD_MESSAGES</span> or{` `}
                  <span className="font-mono">DIRECT_MESSAGES</span> selected it
                  has nothing to populate.
                </p>
              ) : null}
            </div>
          </Dialog>
        </Popover>
      </DialogTrigger>

      {/* The Connect button is also disabled while the browser's socket to the
          Worker is down, which is otherwise invisible: you type a token,
          nothing happens, and there is no way to tell why. */}
      {!online ? (
        <p role="status" className="text-xs text-warn">
          Not connected to the inspector server, so Connect is disabled. Check
          that <code className="font-mono">vp run dev</code> is running, and
          that this page is open on the port it printed.
        </p>
      ) : null}
    </>
  );
};
