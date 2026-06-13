import { useClient } from "./ambient.js";
import type { DiscordClient } from "./client.js";
import type { FfiFunction, FfiLibrary } from "./ffi/backend.js";
import { AUTHORIZATION_TOKEN_TYPE } from "./types.js";

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

interface AuthBindings {
  getPresenceScopes: FfiFunction;
  getCommunicationScopes: FfiFunction;
  createVerifier: FfiFunction;
  verifierChallenge: FfiFunction;
  verifierVerifier: FfiFunction;
  argsInit: FfiFunction;
  argsDrop: FfiFunction;
  argsSetClientId: FfiFunction;
  argsSetScopes: FfiFunction;
  argsSetCodeChallenge: FfiFunction;
  authorize: FfiFunction;
  getToken: FfiFunction;
  updateToken: FfiFunction;
  connect: FfiFunction;
  resultSuccessful: FfiFunction;
  authorizationCb: unknown;
  tokenExchangeCb: unknown;
  updateTokenCb: unknown;
}

/**
 * Auth C functions bound lazily per library — kept out of any consumer that
 * imports only presence or only the lifecycle (the tree-shaking boundary).
 */
const bindingsByLib = new WeakMap<FfiLibrary, AuthBindings>();

const authBindings = (lib: FfiLibrary): AuthBindings => {
  const cached = bindingsByLib.get(lib);
  if (cached) return cached;
  const bindings: AuthBindings = {
    getPresenceScopes: lib.func(
      `void Discord_Client_GetDefaultPresenceScopes(Discord_String *returnValue)`
    ),
    getCommunicationScopes: lib.func(
      `void Discord_Client_GetDefaultCommunicationScopes(Discord_String *returnValue)`
    ),
    createVerifier: lib.func(
      `void Discord_Client_CreateAuthorizationCodeVerifier(void *self, void *returnValue)`
    ),
    verifierChallenge: lib.func(
      `void Discord_AuthorizationCodeVerifier_Challenge(void *self, void *returnValue)`
    ),
    verifierVerifier: lib.func(
      `void Discord_AuthorizationCodeVerifier_Verifier(void *self, Discord_String *returnValue)`
    ),
    argsInit: lib.func(`void Discord_AuthorizationArgs_Init(void *self)`),
    argsDrop: lib.func(`void Discord_AuthorizationArgs_Drop(void *self)`),
    argsSetClientId: lib.func(
      `void Discord_AuthorizationArgs_SetClientId(void *self, uint64_t value)`
    ),
    argsSetScopes: lib.func(
      `void Discord_AuthorizationArgs_SetScopes(void *self, Discord_String value)`
    ),
    argsSetCodeChallenge: lib.func(
      // Header: `Discord_AuthorizationCodeChallenge* value` — a POINTER to the
      // challenge handle (NOT by value). Pass the challenge handle pointer.
      `void Discord_AuthorizationArgs_SetCodeChallenge(void *self, void *value)`
    ),
    authorize: lib.func(
      `void Discord_Client_Authorize(void *self, void *args, void *cb, void *cbFree, void *cbUserData)`
    ),
    getToken: lib.func(
      `void Discord_Client_GetToken(void *self, uint64_t applicationId, Discord_String code, Discord_String codeVerifier, Discord_String redirectUri, void *cb, void *cbFree, void *cbUserData)`
    ),
    updateToken: lib.func(
      `void Discord_Client_UpdateToken(void *self, int tokenType, Discord_String token, void *cb, void *cbFree, void *cbUserData)`
    ),
    connect: lib.func(`void Discord_Client_Connect(void *self)`),
    resultSuccessful: lib.func(
      `bool Discord_ClientResult_Successful(void *self)`
    ),
    authorizationCb: lib.defineCallback(
      `void AuthorizationCallback(void *result, Discord_String code, Discord_String redirectUri, void *userData)`
    ),
    tokenExchangeCb: lib.defineCallback(
      `void TokenExchangeCallback(void *result, Discord_String accessToken, Discord_String refreshToken, int tokenType, int32_t expiresIn, Discord_String scopes, void *userData)`
    ),
    updateTokenCb: lib.defineCallback(
      `void UpdateTokenCallback(void *result, void *userData)`
    )
  };
  bindingsByLib.set(lib, bindings);
  return bindings;
};

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
  const b = authBindings(lib);

  // String out-params (`Discord_String*`) need a Discord_String-sized buffer;
  // opaque-handle out-params (verifier/challenge) use a handle-sized buffer.
  const scopesOut = lib.allocStringOut();
  (options.scopes === `communication`
    ? b.getCommunicationScopes
    : b.getPresenceScopes)(scopesOut);
  const scopes = lib.decodeString(scopesOut);

  const verifier = lib.allocHandle();
  b.createVerifier(client.handle, verifier);
  const challenge = lib.allocHandle();
  b.verifierChallenge(verifier, challenge);
  const verifierOut = lib.allocStringOut();
  b.verifierVerifier(verifier, verifierOut);
  const codeVerifier = lib.decodeString(verifierOut);

  const args = lib.allocHandle();
  b.argsInit(args);
  b.argsSetClientId(args, client.applicationId);
  b.argsSetScopes(args, lib.encodeString(scopes));
  b.argsSetCodeChallenge(args, challenge);

  const { code, redirectUri } = await new Promise<{
    code: string;
    redirectUri: string;
  }>((resolve, reject) => {
    const cb = lib.registerCallback(
      b.authorizationCb,
      (result: unknown, codeStr: unknown, redirectStr: unknown) => {
        if (!isSuccessful(b, result)) {
          reject(new Error(`Discord authorization was denied or failed.`));
          return;
        }
        resolve({
          code: lib.decodeString(codeStr),
          redirectUri: lib.decodeString(redirectStr)
        });
      }
    );
    client.trackCallback(cb);
    b.authorize(client.handle, args, cb, null, null);
  });
  b.argsDrop(args);

  const accessToken = await new Promise<string>((resolve, reject) => {
    const cb = lib.registerCallback(
      b.tokenExchangeCb,
      (result: unknown, token: unknown) => {
        if (!isSuccessful(b, result)) {
          reject(new Error(`Discord token exchange failed.`));
          return;
        }
        resolve(lib.decodeString(token));
      }
    );
    client.trackCallback(cb);
    b.getToken(
      client.handle,
      client.applicationId,
      lib.encodeString(code),
      lib.encodeString(codeVerifier),
      lib.encodeString(redirectUri),
      cb,
      null,
      null
    );
  });

  await new Promise<void>((resolve, reject) => {
    const cb = lib.registerCallback(b.updateTokenCb, (result: unknown) => {
      if (!isSuccessful(b, result)) {
        reject(new Error(`Discord token update failed.`));
        return;
      }
      resolve();
    });
    client.trackCallback(cb);
    b.updateToken(
      client.handle,
      AUTHORIZATION_TOKEN_TYPE.Bearer,
      lib.encodeString(accessToken),
      cb,
      null,
      null
    );
  });

  b.connect(client.handle);
};

/** Read `Discord_ClientResult_Successful` off a result pointer from a callback. */
const isSuccessful = (b: AuthBindings, result: unknown): boolean =>
  Boolean(b.resultSuccessful(result));
