/**
 * The CORE bridge contract — lifecycle, presence, auth, status, log. Every
 * integration uses these, so they live in the always-loaded core (unlike the
 * opt-in feature domains under `channels/<domain>.ts`).
 *
 * Channel names + payload types + bridge interfaces are **transport-independent**,
 * so this contract is identical to `@discordkit/electron`'s `channels/core.ts` —
 * only the seam underneath (kkrpc vs. ipcRenderer) differs. Each domain owns its
 * own channel names + types in its own module so importing one domain's contract
 * never drags in another's native type imports. Channel strings are namespaced
 * `discordkit:<op>` to avoid colliding with an app's own RPC methods.
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
  logout: `discordkit:logout`,
  setActivity: `discordkit:setActivity`,
  clearActivity: `discordkit:clearActivity`,
  getStatus: `discordkit:getStatus`,
  status: `discordkit:status`,
  log: `discordkit:log`
} as const;

/**
 * Activity input over the bridge. The builder-callback form can't cross the RPC
 * boundary (functions aren't serializable), so only the plain-object form is
 * accepted here. The webview client re-offers the builder form and normalizes it
 * before send.
 */
export type ActivityMessage = ActivityInput;

/** Payload for {@link CORE_CHANNELS.connect}. */
export interface ConnectMessage {
  scopes?: ScopeSet;
}

/** The core surface on the webview bridge (before any domain slices are merged in). */
export interface CoreBridge {
  /**
   * Begin or resume the Discord session. With a token store configured (the
   * default in this example), the sidecar reconnects silently from stored tokens
   * — only opening the browser on first sign-in or after logout. The whole token
   * lifecycle (persistence, refresh) is handled natively; watch {@link onStatus}.
   */
  connect: (message?: ConnectMessage) => Promise<void>;
  /** End the session: clear stored tokens and disconnect (next connect re-auths). */
  logout: () => Promise<void>;
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
