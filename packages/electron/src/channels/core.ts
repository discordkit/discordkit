/**
 * The CORE IPC contract — lifecycle, presence, auth, status, log. Every
 * integration uses these, so they live in the always-loaded core (unlike the
 * opt-in feature domains under `channels/<domain>.ts`).
 *
 * Each domain owns its own channel names + payload types in its own module, so
 * importing one domain's contract never drags in another's native type imports.
 * Channel strings are namespaced `discordkit:<domain>:<op>` to avoid colliding
 * with an app's own IPC.
 */

import type {
  ActivityInput,
  ActivityBuilder
} from "@discordkit/native/presence";
import type { ScopeSet } from "@discordkit/native/auth";
import type { LogEntry, Status } from "@discordkit/native";
import type { Unsubscribe } from "../internal.js";

/** Core channel names (lifecycle / presence / auth / status / log). */
export const CORE_CHANNELS = {
  connect: `discordkit:connect`,
  setActivity: `discordkit:setActivity`,
  clearActivity: `discordkit:clearActivity`,
  getStatus: `discordkit:getStatus`,
  status: `discordkit:status`,
  log: `discordkit:log`
} as const;

/** Activity input over IPC. The builder-callback form can't cross IPC (functions
 * aren't structured-cloneable), so only the plain-object form is accepted here.
 * The renderer client re-offers the builder form and normalizes it before send. */
export type ActivityMessage = ActivityInput;

/** Payload for {@link CORE_CHANNELS.connect}. */
export interface ConnectMessage {
  scopes?: ScopeSet;
}

/** The core surface on `window.discord` (before any domain slices are merged in). */
export interface CoreBridge {
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
  onStatus: (handler: (status: Status) => void) => Unsubscribe;
  /** Subscribe to SDK log lines. Returns an unsubscribe function. */
  onLog: (handler: (entry: LogEntry) => void) => Unsubscribe;
}
