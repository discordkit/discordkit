import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import type { OAuth2Scope } from "./OAuth2Scope.js";

/**
 * Valibot schema for the raw token response Discord returns from
 * `POST /oauth2/token`, in its original `snake_case` shape. This is the source
 * of truth: {@link RawTokenResponse} is inferred from it, the flow utilities
 * validate Discord's responses against it, and the e2e mocks generate fixtures
 * from it (Valimock). The camelCased {@link TokenResponse} is the public form
 * the flow utilities normalize to.
 */
const _rawTokenResponseSchema = v.object({
  access_token: v.string(),
  token_type: v.literal(`Bearer`),
  expires_in: v.number(),
  refresh_token: v.exactOptional(v.string()),
  scope: v.string(),
  /**
   * Present only on the webhook flow (`scope=webhook.incoming`). Left as
   * `unknown` here — the webhook object is owned by `@discordkit/client`.
   */
  webhook: v.exactOptional(v.unknown())
});

/**
 * The raw token response Discord returns from `POST /oauth2/token`. Consumers
 * should prefer {@link TokenResponse}, the camelCased form the flow utilities
 * resolve to.
 *
 * @internal
 */
export interface RawTokenResponse extends v.InferOutput<
  typeof _rawTokenResponseSchema
> {}

export const rawTokenResponseSchema = schema<RawTokenResponse>(
  _rawTokenResponseSchema
);

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
