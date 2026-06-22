/**
 * Auth — the public surface of `@discordkit/native/auth`.
 *
 * {@link authorize} runs the OAuth2 PKCE flow (verifier → browser authorize → token exchange → update → connect) against the ambient client. The PKCE verifier and `AuthorizationArgs` objects are owned by their per-class modules ({@link ./authorizationCodeVerifier.ts}, {@link ./authorizationArgs.ts}).
 */
export { authorize, refreshToken } from "./authorize.js";
export type { ScopeSet, AuthorizeOptions, TokenSet } from "./authorize.js";

// Typed auth failure (timeout / declined / failed) for UI branching.
export { AuthorizeError } from "./authError.js";
export type { AuthorizeErrorReason } from "./authError.js";

// Session lifecycle (persistence + silent reconnect + proactive refresh) — native
// owns the whole token lifecycle; the bridge/UI just calls these + watches status.
export { startSession, resumeSession, endSession } from "./session.js";
export type { SessionOptions } from "./session.js";
export type { TokenStore, StoredTokens } from "./tokenStore.js";

// A pure-Node encrypted-file token store (no native addon — safe in a SEA sidecar).
// The OS-keychain backend ships separately at `@discordkit/native/auth/keyring`.
export { fileStore } from "./fileStore.js";
