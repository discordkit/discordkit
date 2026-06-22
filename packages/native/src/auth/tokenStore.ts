/**
 * The credential-persistence seam for the Social SDK session.
 *
 * Discord's OAuth tokens (access ~7 days + a refresh token) must be stored by the
 * integrator so a player isn't sent through the browser on every launch. This
 * interface is the OS- and host-agnostic contract for that storage: a backend
 * implements `load`/`save`/`clear`, and the session layer (see ./session.ts)
 * drives it — persisting on authorize, reloading + refreshing on launch, and
 * clearing on logout or an irrecoverable refresh failure.
 *
 * The same seam works under Electron, Tauri, or plain Node — pass a `tokenStore`
 * in `ClientConfig` and the session lifecycle is handled at the native level. A
 * cross-platform OS-keychain backend ships at `@discordkit/native/auth/keyring`; a
 * consumer can also supply any `{ load, save, clear }` (a file, a remote vault, an
 * in-memory stub for tests).
 */

/** The token set persisted between sessions, as the SDK's token exchange yields it. */
export interface StoredTokens {
  /** The OAuth2 access token (Bearer). Expires — see {@link expiresAt}. */
  accessToken: string;
  /** The refresh token, used to obtain a new access token without re-authorizing. */
  refreshToken: string;
  /** Absolute expiry of the access token, epoch ms (from the exchange's `expiresIn`). */
  expiresAt: number;
  /** The space-delimited scopes the tokens were granted. */
  scopes: string;
}

/**
 * A pluggable credential store. All methods are async so a backend can hit the OS
 * keychain, a file, or a network vault. Every method should resolve (not throw) in
 * the normal "nothing stored yet" case — `load` returns `undefined`.
 */
export interface TokenStore {
  /** Load the persisted tokens, or `undefined` if none are stored. */
  load: () => Promise<StoredTokens | undefined>;
  /** Persist the tokens (overwriting any previous set). */
  save: (tokens: StoredTokens) => Promise<void>;
  /** Remove any persisted tokens (logout, or after an `invalid_grant` refresh). */
  clear: () => Promise<void>;
}
