import { useClient } from "../ambient.js";
import type { DiscordClient } from "../client.js";
import { awaitResult, defineBindings } from "../ffi/bindings.js";
import { AUTHORIZATION_TOKEN_TYPE } from "../types.js";
import { buildAuthorizationArgs } from "./authorizationArgs.js";
import { createPkcePair } from "./authorizationCodeVerifier.js";

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
 * @remarks Validated by the real-SDK local smoke test (it requires a real
 *   application ID and a browser round-trip, so it can't run against the stub).
 */
export const authorize = async (
  options: AuthorizeOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const lib = client.lib;
  const b = bindings(lib);

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

  // 2. Exchange the code for an access token.
  const accessToken = await awaitResult<string>(
    client,
    b.tokenExchangeCb,
    (ptr) =>
      b.getToken(
        client.handle,
        client.applicationId,
        lib.encodeString(code),
        lib.encodeString(verifier),
        lib.encodeString(redirectUri),
        ptr,
        null,
        null
      ),
    (token) => lib.decodeString(token),
    { label: `token exchange` }
  );

  // 3. Hand the token to the SDK, then connect.
  await awaitResult(
    client,
    b.updateTokenCb,
    (ptr) =>
      b.updateToken(
        client.handle,
        AUTHORIZATION_TOKEN_TYPE.Bearer,
        lib.encodeString(accessToken),
        ptr,
        null,
        null
      ),
    () => undefined,
    { label: `token update` }
  );

  b.connect(client.handle);
};
