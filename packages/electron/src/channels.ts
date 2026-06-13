/**
 * The IPC contract shared by the main, preload, and renderer sides of the
 * adapter. Keeping channel names and payload shapes in one module is what makes
 * the bridge type-safe across the process boundary — main and renderer agree on
 * exactly these strings and types.
 */

import type {
  ActivityInput,
  ActivityBuilder
} from "@discordkit/native/presence";
import type { ScopeSet } from "@discordkit/native/auth";
import type { LogEntry, Status } from "@discordkit/native";

/** Channel names. Namespaced to avoid collisions with an app's own IPC. */
export const CHANNELS = {
  /** renderer → main, invoke: run the OAuth2 flow + connect. */
  connect: `discordkit:connect`,
  /** renderer → main, invoke: set rich presence. */
  setActivity: `discordkit:setActivity`,
  /** renderer → main, invoke: clear rich presence. */
  clearActivity: `discordkit:clearActivity`,
  /** renderer → main, invoke: read the current status synchronously. */
  getStatus: `discordkit:getStatus`,
  /** main → renderer, send: status changed. */
  status: `discordkit:status`,
  /** main → renderer, send: a log line. */
  log: `discordkit:log`
} as const;

/** Activity input over IPC. The builder-callback form can't cross IPC (functions
 * aren't structured-cloneable), so only the plain-object form is accepted here.
 * The renderer client re-offers the builder form and normalizes it before send. */
export type ActivityMessage = ActivityInput;

/** Payload for {@link CHANNELS.connect}. */
export interface ConnectMessage {
  scopes?: ScopeSet;
}

/**
 * The API exposed to the renderer on `window.discord` by the preload bridge.
 * The renderer-side client implements this; the preload wires it to IPC.
 */
export interface DiscordBridge {
  /** Run the Discord OAuth2 flow (opens the system browser) and connect. */
  connect: (message?: ConnectMessage) => Promise<void>;
  /** Set rich presence. Accepts the object form, or a builder callback. */
  setActivity: (
    input: ActivityMessage | ((builder: ActivityBuilder) => void)
  ) => Promise<void>;
  /** Clear rich presence. */
  clearActivity: () => Promise<void>;
  /** Read the current connection status. */
  getStatus: () => Promise<Status>;
  /** Subscribe to status changes. Returns an unsubscribe function. */
  onStatus: (handler: (status: Status) => void) => () => void;
  /** Subscribe to SDK log lines. Returns an unsubscribe function. */
  onLog: (handler: (entry: LogEntry) => void) => () => void;
}
