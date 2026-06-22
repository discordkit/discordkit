import { useClient } from "../ambient.js";
import type { DiscordClient } from "../client.js";
import { awaitResult, defineBindings } from "../ffi/bindings.js";
import { AUTHORIZATION_TOKEN_TYPE_CODE } from "../types.js";
import { buildAuthorizationArgs } from "./authorizationArgs.js";
import { createPkcePair } from "./authorizationCodeVerifier.js";
import { toAuthorizeError } from "./authError.js";

/**
 * OAuth2 scope set to request. `presence` covers account-linking + rich presence
 * (`Discord_Client_GetDefaultPresenceScopes`); `communication` additionally
 * covers lobbies/voice/DMs (`...GetDefaultCommunicationScopes`).
 */
export type ScopeSet = `presence` | `communication`;

/** Options for {@link authorize}. */
export interface AuthorizeOptions {
  /** Which default scope set to request. Default `presence`. */
  scopes?: ScopeSet;
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
}

/**
 * The token set a token exchange (`GetToken`) or refresh (`RefreshToken`) yields:
 * the access token, the refresh token, the absolute access-token expiry (epoch
 * ms), and the granted scopes. The session layer persists this for silent
 * reconnect; see {@link StoredTokens} (the same shape).
 */
export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  /** Absolute expiry of the access token, epoch ms. */
  expiresAt: number;
  scopes: string;
}

/**
 * Build the `TokenExchangeCallback` reader: maps the callback's
 * `(accessToken, refreshToken, tokenType, expiresIn, scopes)` into a
 * {@link TokenSet}, converting the relative `expiresIn` (seconds) to an absolute
 * `expiresAt` (epoch ms). Shared by {@link authorize} and `refreshToken`.
 */
export const readTokenSet =
  (lib: DiscordClient[`lib`]) =>
  (
    accessToken: unknown,
    refreshToken: unknown,
    _tokenType: unknown,
    expiresIn: unknown,
    scopes: unknown
  ): TokenSet => ({
    accessToken: lib.decodeString(accessToken),
    refreshToken: lib.decodeString(refreshToken),
    expiresAt: Date.now() + Number(expiresIn) * 1000,
    scopes: lib.decodeString(scopes)
  });

/**
 * Hand an access token to the SDK (`UpdateToken`, Bearer). Shared by
 * {@link authorize} and `refreshToken`; the caller issues `Connect` after.
 */
export const applyToken = async (
  client: DiscordClient,
  accessToken: string
): Promise<void> => {
  const lib = client.lib;
  const b = bindings(lib);
  await awaitResult(
    client,
    b.updateTokenCb,
    (ptr) =>
      b.updateToken(
        client.handle,
        AUTHORIZATION_TOKEN_TYPE_CODE.bearer,
        lib.encodeString(accessToken),
        ptr,
        null,
        null
      ),
    () => undefined,
    { label: `token update` }
  );
};

/**
 * Client-level auth operations: the default-scope readers and the three async
 * flow steps (`Authorize` → `GetToken` → `UpdateToken`) plus `Connect`. The
 * `AuthorizationArgs`/PKCE-verifier objects are owned by their own modules. The
 * only declarer of these auth C functions (the tree-shaking boundary).
 */
const bindings = defineBindings({
  getPresenceScopes: /* C */ `void Discord_Client_GetDefaultPresenceScopes(Discord_String *returnValue)`,
  getCommunicationScopes: /* C */ `void Discord_Client_GetDefaultCommunicationScopes(Discord_String *returnValue)`,
  authorize: /* C */ `void Discord_Client_Authorize(void *self, void *args, void *cb, void *cbFree, void *cbUserData)`,
  getToken: /* C */ `void Discord_Client_GetToken(void *self, uint64_t applicationId, Discord_String code, Discord_String codeVerifier, Discord_String redirectUri, void *cb, void *cbFree, void *cbUserData)`,
  refreshToken: /* C */ `void Discord_Client_RefreshToken(void *self, uint64_t applicationId, Discord_String refreshToken, void *cb, void *cbFree, void *cbUserData)`,
  updateToken: /* C */ `void Discord_Client_UpdateToken(void *self, int tokenType, Discord_String token, void *cb, void *cbFree, void *cbUserData)`,
  connect: /* C */ `void Discord_Client_Connect(void *self)`,
  authorizationCb: {
    callback: /* C */ `void AuthorizationCallback(void *result, Discord_String code, Discord_String redirectUri, void *userData)`
  },
  tokenExchangeCb: {
    callback: /* C */ `void TokenExchangeCallback(void *result, Discord_String accessToken, Discord_String refreshToken, int tokenType, int32_t expiresIn, Discord_String scopes, void *userData)`
  },
  updateTokenCb: {
    callback: /* C */ `void UpdateTokenCallback(void *result, void *userData)`
  }
});

/**
 * Run the Social SDK OAuth2 PKCE flow and connect:
 * `CreateAuthorizationCodeVerifier` → `Authorize` (opens the browser) →
 * `GetToken` → `UpdateToken` → `Connect`. Resolves once `UpdateToken` succeeds
 * and `Connect` has been issued; watch `client.status` for `Ready`.
 *
 * Returns the issued {@link TokenSet} (access + refresh + expiry + scopes) so the
 * session layer can persist it for silent reconnect — see ./session.ts. Callers
 * who don't manage a session can ignore the return value.
 *
 * @remarks Validated by the real-SDK local smoke test (it requires a real
 *   application ID and a browser round-trip, so it can't run against the stub).
 */
export const authorize = async (
  options: AuthorizeOptions = {}
): Promise<TokenSet> => {
  const client = options.client ?? useClient();
  const lib = client.lib;
  const b = bindings(lib);

  try {
    // Resolve the requested scope string (a Discord_String* out-param).
    const scopesOut = lib.allocStringOut();
    (options.scopes === `communication`
      ? b.getCommunicationScopes
      : b.getPresenceScopes)(scopesOut);
    const scopes = lib.decodeString(scopesOut);

    // PKCE: create the verifier, read out the challenge handle + verifier string.
    const { challenge, verifier } = createPkcePair(lib, client.handle);

    // Build the args object; `using` drops it after Authorize copies it.
    using args = buildAuthorizationArgs(lib, {
      clientId: client.applicationId,
      scopes,
      challenge
    });

    // 1. Authorize → opens the browser; the callback yields the auth code.
    const { code, redirectUri } = await awaitResult<{
      code: string;
      redirectUri: string;
    }>(
      client,
      b.authorizationCb,
      (ptr) => b.authorize(client.handle, args.handle, ptr, null, null),
      (codeStr, redirectStr) => ({
        code: lib.decodeString(codeStr),
        redirectUri: lib.decodeString(redirectStr)
      }),
      { label: `authorization` }
    );

    // 2. Exchange the code for the full token set (access + refresh + expiry).
    const tokens = await awaitResult<TokenSet>(
      client,
      b.tokenExchangeCb,
      (ptr) =>
        b.getToken(
          client.handle,
          BigInt(client.applicationId),
          lib.encodeString(code),
          lib.encodeString(verifier),
          lib.encodeString(redirectUri),
          ptr,
          null,
          null
        ),
      readTokenSet(lib),
      { label: `token exchange` }
    );

    // 3. Hand the token to the SDK, then connect.
    await applyToken(client, tokens.accessToken);
    b.connect(client.handle);
    return tokens;
  } catch (error) {
    // Surface a typed reason (timeout / declined / failed) for UI branching.
    throw toAuthorizeError(error);
  }
};

/**
 * Exchange a stored refresh token for a fresh {@link TokenSet} (no browser):
 * `RefreshToken` → `UpdateToken` → `Connect`. Used by the session layer to
 * reconnect silently on launch and to refresh proactively before expiry.
 *
 * Rejects if the refresh token is no longer valid (the SDK surfaces the
 * `invalid_grant` the OAuth endpoint returns when the user revoked the app,
 * unlinked, or was banned) — the session layer treats that as "needs re-auth".
 */
export const refreshToken = async (
  refreshTokenValue: string,
  options: { client?: DiscordClient } = {}
): Promise<TokenSet> => {
  const client = options.client ?? useClient();
  const lib = client.lib;
  const b = bindings(lib);

  try {
    const tokens = await awaitResult<TokenSet>(
      client,
      b.tokenExchangeCb,
      (ptr) =>
        b.refreshToken(
          client.handle,
          BigInt(client.applicationId),
          lib.encodeString(refreshTokenValue),
          ptr,
          null,
          null
        ),
      readTokenSet(lib),
      { label: `token refresh` }
    );

    await applyToken(client, tokens.accessToken);
    b.connect(client.handle);
    return tokens;
  } catch (error) {
    throw toAuthorizeError(error);
  }
};
