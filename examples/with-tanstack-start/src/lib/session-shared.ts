/**
 * Client-safe session surface: the `Session` shape and the pure
 * `hasUsableSession` predicate. These are imported by route *components*
 * (which run on the client too), so they must NOT pull in the server-only
 * pieces of `session.ts` — `jose`, TanStack's `getCookie`/`setCookie`, or the
 * `SESSION_SECRET` env value. Keeping them in their own module severs that
 * import edge: TanStack Start's import-protection plugin would otherwise warn
 * that a client bundle could drag the secret in. `session.ts` re-exports these
 * so server code still has a single import site.
 */

/** The data we persist between requests: just the tokens needed to call Discord. */
export interface Session {
  accessToken: string;
  refreshToken?: string;
  /** Epoch ms when the access token expires, derived from `expiresIn`. */
  expiresAt: number;
}

/**
 * Whether the session looks usable for rendering the logged-in UI: it exists
 * and is either unexpired or has a refresh token. An expired-and-unrefreshable
 * session is treated as logged out. Pure — safe to call from any environment.
 */
export const hasUsableSession = (session: Session | null): boolean =>
  session !== null &&
  (session.expiresAt > Date.now() || session.refreshToken !== undefined);
