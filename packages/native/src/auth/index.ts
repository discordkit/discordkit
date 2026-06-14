/**
 * Auth — the public surface of `@discordkit/native/auth`.
 *
 * {@link authorize} runs the OAuth2 PKCE flow (verifier → browser authorize → token exchange → update → connect) against the ambient client. The PKCE verifier and `AuthorizationArgs` objects are owned by their per-class modules ({@link ./authorizationCodeVerifier.ts}, {@link ./authorizationArgs.ts}).
 */
export { authorize } from "./authorize.js";
export type { ScopeSet, AuthorizeOptions } from "./authorize.js";
