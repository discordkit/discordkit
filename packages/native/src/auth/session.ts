import { useClient } from "../ambient.js";
import type { DiscordClient } from "../client.js";
import { defineBindings } from "../ffi/bindings.js";
import {
  authorize,
  refreshToken,
  applyToken,
  type ScopeSet
} from "./authorize.js";
import type { StoredTokens, TokenStore } from "./tokenStore.js";

/**
 * Native-owned session lifecycle: persistence + silent reconnect + proactive
 * refresh, so the player authorizes through the browser ONCE and reconnects
 * automatically on every later launch.
 *
 * The bridge/UI stays thin — it calls {@link startSession} (which connects
 * silently if tokens are stored, else runs the browser flow) and {@link endSession}
 * (logout), and observes `client.status`. All Discord auth communication and the
 * refresh timing live here, close to native.
 */

const bindings = defineBindings({
  connect: /* C */ `void Discord_Client_Connect(void *self)`,
  disconnect: /* C */ `void Discord_Client_Disconnect(void *self)`,
  setTokenExpirationCb: /* C */ `void Discord_Client_SetTokenExpirationCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  expirationCb: {
    callback: /* C */ `void TokenExpirationCallback(void *userData)`
  }
});

export interface SessionOptions {
  /** Scope set for the initial browser authorize. Default `presence`. */
  scopes?: ScopeSet;
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
}

/** Refresh this many ms before the access token's expiry (a safety margin). */
const REFRESH_SKEW_MS = 60_000;

/** Resolve the token store for a client, or throw a clear error if none is set. */
const storeOf = (client: DiscordClient): TokenStore => {
  const store = client.tokenStore;
  if (!store) {
    throw new Error(
      `Session persistence needs a \`tokenStore\`. Pass one in the client config ` +
        `(e.g. the keychain store from \`@discordkit/native/auth/keyring\`), or use ` +
        `\`authorize()\` directly for a one-off, non-persisted sign-in.`
    );
  }
  return store;
};

/** Whether a stored access token is still usable (with a refresh safety margin). */
const isFresh = (tokens: StoredTokens): boolean =>
  tokens.expiresAt - REFRESH_SKEW_MS > Date.now();

/**
 * Wire the SDK's token-expiration callback to refresh proactively. The SDK fires
 * it as the access token nears expiry; we refresh, re-apply, reconnect, and
 * re-persist — all without the player noticing. Registered once per session.
 */
const armProactiveRefresh = (
  client: DiscordClient,
  store: TokenStore
): void => {
  const b = bindings(client.lib);
  const cb = client.lib.registerCallback(b.expirationCb, () => {
    void refreshAndStore(client, store);
  });
  client.trackCallback(cb);
  b.setTokenExpirationCb(client.handle, cb, null, null);
};

/** Refresh using the stored refresh token, persist the new set; clear on failure. */
const refreshAndStore = async (
  client: DiscordClient,
  store: TokenStore
): Promise<StoredTokens> => {
  const current = await store.load();
  if (!current) {
    throw new Error(`No stored tokens to refresh; call startSession first.`);
  }
  try {
    const next = await refreshToken(current.refreshToken, { client });
    await store.save(next);
    return next;
  } catch (error) {
    // An invalid_grant (revoked / unlinked / banned) can't be recovered — drop the
    // stale tokens so the next startSession falls back to the browser flow.
    await store.clear();
    throw error;
  }
};

/**
 * Reconnect SILENTLY from stored tokens, without ever opening the browser.
 * Refreshes first if the access token is near expiry. Returns `true` if it
 * connected (stored tokens were present + usable), `false` if there was nothing
 * to resume — so it's safe to call on every launch/boot to auto-reconnect.
 *
 * Arms proactive refresh once connected. Resolves when `Connect` is issued (watch
 * `client.status` for `ready`).
 */
export const resumeSession = async (
  options: { client?: DiscordClient } = {}
): Promise<boolean> => {
  const client = options.client ?? useClient();
  const store = storeOf(client);

  const stored = await store.load();
  if (!stored) return false;

  if (isFresh(stored)) {
    // Still-valid access token: apply it + connect directly (don't burn a
    // refresh — some servers rotate the refresh token on every use).
    await applyToken(client, stored.accessToken);
    bindings(client.lib).connect(client.handle);
  } else {
    // Expired/near-expiry: refresh (re-applies + connects) and re-persist. If the
    // grant is gone, the tokens are already cleared — report "couldn't resume".
    try {
      await refreshAndStore(client, store);
    } catch {
      return false;
    }
  }

  armProactiveRefresh(client, store);
  return true;
};

/**
 * Start (or resume) the session. Reconnects silently from stored tokens if it
 * can ({@link resumeSession}); otherwise runs the browser authorize flow and
 * persists the result. This is the explicit "Connect" path; on boot, prefer
 * {@link resumeSession} so a missing-token launch doesn't pop the browser.
 */
export const startSession = async (
  options: SessionOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  if (await resumeSession({ client })) return;

  const store = storeOf(client);
  await authorizeAndStore(client, store, options.scopes);
  armProactiveRefresh(client, store);
};

/** Run the browser authorize flow and persist the issued tokens. */
const authorizeAndStore = async (
  client: DiscordClient,
  store: TokenStore,
  scopes: ScopeSet | undefined
): Promise<void> => {
  const tokens = await authorize({ client, scopes });
  await store.save(tokens);
};

/**
 * End the session: clear the stored tokens and disconnect. The next
 * {@link startSession} will require a fresh browser authorize.
 */
export const endSession = async (
  options: { client?: DiscordClient } = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  await client.tokenStore?.clear();
  bindings(client.lib).disconnect(client.handle);
};
