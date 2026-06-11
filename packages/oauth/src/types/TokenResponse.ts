import type { OAuth2Scope } from "./OAuth2Scope.js";

/**
 * The raw token response Discord returns from `POST /oauth2/token`, in its
 * original `snake_case` shape. Consumers should prefer {@link TokenResponse},
 * which is the camelCased form the flow utilities resolve to.
 *
 * @internal
 */
export interface RawTokenResponse {
  access_token: string;
  token_type: `Bearer`;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  /**
   * Present only on the webhook flow (`scope=webhook.incoming`). Left as
   * `unknown` here — the webhook object is owned by `@discordkit/client`.
   */
  webhook?: unknown;
}

/**
 * A successful token exchange / refresh result, normalized to `camelCase` to
 * match the rest of the discordkit ecosystem.
 *
 * - `refreshToken` is absent for the client-credentials grant (Discord issues
 *   no refresh token for that flow).
 * - `scope` is split from Discord's space-delimited string into an array.
 * - `webhook` is only present on the webhook flow; it is typed as `unknown`
 *   so this package need not depend on `@discordkit/client` for the webhook
 *   object shape. Cast it at the call site if you requested `webhook.incoming`.
 */
export interface TokenResponse {
  /** The bearer access token to authenticate Discord API requests as the user. */
  accessToken: string;
  /** Always `"Bearer"` for the Discord OAuth2 flows. */
  tokenType: `Bearer`;
  /** Seconds until {@link accessToken} expires. */
  expiresIn: number;
  /** Token used to obtain a fresh {@link accessToken}; absent for client credentials. */
  refreshToken?: string;
  /** The scopes actually granted, split from Discord's space-delimited string. */
  scope: OAuth2Scope[];
  /** Present only on the webhook flow (`scope=webhook.incoming`). */
  webhook?: unknown;
}
