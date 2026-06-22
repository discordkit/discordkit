import {
  registerMockHandlers,
  type MockContext
} from "../../__tests__/mockBackend.js";

/**
 * Mock behavior for the auth domain — registered with the shared mock backend.
 * Scripts the OAuth2 PKCE flow's three result-bearing callbacks with success +
 * canned payloads: Authorize → `(code, redirectUri)`, GetToken → `(accessToken)`,
 * UpdateToken → `()`. The PKCE-verifier getters return fixed strings so the flow
 * has a verifier to pass to GetToken.
 *
 * Mock string values are written into out-params via `ctx.writeString`.
 */
const writeStr = (ctx: MockContext, out: unknown, value: string): void => {
  ctx.writeString(out, value);
};

registerMockHandlers({
  // Default-scope readers: return a canned scope string.
  Discord_Client_GetDefaultPresenceScopes: (ctx) => {
    writeStr(ctx, ctx.args[0], `identify rpc`);
    return undefined;
  },
  Discord_Client_GetDefaultCommunicationScopes: (ctx) => {
    writeStr(ctx, ctx.args[0], `identify rpc dm_channels.messages.read`);
    return undefined;
  },
  // PKCE verifier: create yields a handle; the verifier string reads back.
  Discord_Client_CreateAuthorizationCodeVerifier: () => undefined,
  Discord_AuthorizationCodeVerifier_Challenge: () => undefined,
  Discord_AuthorizationCodeVerifier_Verifier: (ctx) => {
    writeStr(ctx, ctx.args[1], `mock-verifier`);
    return undefined;
  },
  // The three async steps: fire the result callback (success) + its payload.
  Discord_Client_Authorize: (ctx) => {
    // AuthorizationCallback(result, code, redirectUri, userData)
    ctx.fireResultCallback(
      { __str: `mock-code` },
      { __str: `http://127.0.0.1/callback` }
    );
    return undefined;
  },
  Discord_Client_GetToken: (ctx) => {
    // TokenExchangeCallback(result, accessToken, …)
    ctx.fireResultCallback({ __str: `mock-access-token` });
    return undefined;
  },
  Discord_Client_UpdateToken: (ctx) => {
    ctx.fireResultCallback();
    return undefined;
  }
});
