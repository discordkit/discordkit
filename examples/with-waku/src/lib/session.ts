import { SignJWT, jwtVerify } from "jose";
import { unstable_getRequest } from "waku/router/server";
import { ENV } from "varlock/env";
import { parseCookies } from "@discordkit/oauth";
import type { TokenResponse } from "@discordkit/oauth";
import { type Session, hasUsableSession } from "./session-shared.js";

// Re-export the client-safe surface so server code keeps a single import site.
// The runtime values live in session-shared.ts (no secret), so page components
// can import them without dragging SESSION_SECRET clientward.
export { type Session, hasUsableSession };

/**
 * Stateless session management for the OAuth2 tokens: a signed JWT (`jose`)
 * stored in an httpOnly cookie.
 *
 * Waku's model is explicitly Web-standard — there's no ambient mutable response
 * to call `setCookie()` on (unlike Next's `cookies()` or TanStack's `setCookie`).
 * So this module splits cleanly:
 *   - READS use Waku's `unstable_getRequest()` to read the request `Cookie`
 *     header (works in API routes, page server components, and loaders).
 *   - WRITES produce a `Set-Cookie` *string* that the caller attaches to the
 *     `Response` it returns (the auth handler's `onSuccess`, the logout/refresh
 *     API routes). That maps 1:1 onto how @discordkit/oauth composes responses.
 *
 * Intentionally minimal to keep the example self-contained. For production,
 * prefer a dedicated auth library (Better Auth, Auth.js, Clerk, …).
 */

const COOKIE_NAME = `__Host-discord_session`;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const encodedKey = new TextEncoder().encode(ENV.SESSION_SECRET);

/** Derive a {@link Session} from a fresh {@link TokenResponse}. */
export const sessionFromTokens = (tokens: TokenResponse): Session => ({
  accessToken: tokens.accessToken,
  ...(tokens.refreshToken === undefined
    ? {}
    : { refreshToken: tokens.refreshToken }),
  expiresAt: Date.now() + tokens.expiresIn * 1000
});

/** Sign the session into a compact JWS suitable for a cookie value. */
const sealSession = async (session: Session): Promise<string> =>
  new SignJWT({ ...session })
    .setProtectedHeader({ alg: `HS256` })
    .setIssuedAt()
    .setExpirationTime(`7d`)
    .sign(encodedKey);

/** Verify and decode a session cookie value, or `null` if absent/invalid. */
const unsealSession = async (
  value: string | undefined
): Promise<Session | null> => {
  if (value === undefined) {
    return null;
  }
  try {
    const { payload } = await jwtVerify<Session>(value, encodedKey, {
      algorithms: [`HS256`]
    });
    return {
      accessToken: payload.accessToken,
      ...(payload.refreshToken === undefined
        ? {}
        : { refreshToken: payload.refreshToken }),
      expiresAt: payload.expiresAt
    };
  } catch {
    // An invalid/expired/tampered cookie is treated as "no session".
    return null;
  }
};

/**
 * Build the `Set-Cookie` header value that persists the session. `__Host-`
 * cookies must be `Secure` + `Path=/` with no `Domain`. The caller attaches
 * this to the `Response` it returns.
 */
export const sealSessionSetCookie = async (session: Session): Promise<string> =>
  [
    `${COOKIE_NAME}=${await sealSession(session)}`,
    `Path=/`,
    `Max-Age=${MAX_AGE_SECONDS}`,
    `SameSite=Lax`,
    `HttpOnly`,
    `Secure`
  ].join(`; `);

/**
 * Build the `Set-Cookie` header value that clears the session (logout). A
 * `__Host-` cookie won't delete unless the clearing cookie matches its
 * Secure/Path attributes — so overwrite with an empty value + `Max-Age=0`
 * rather than relying on a `delete` helper.
 */
export const clearSessionSetCookie = (): string =>
  [
    `${COOKIE_NAME}=`,
    `Path=/`,
    `Max-Age=0`,
    `SameSite=Lax`,
    `HttpOnly`,
    `Secure`
  ].join(`; `);

/** Read and verify a session from an explicit Request's cookies, or `null`.
 * Used by API routes, which receive the `Request` directly. */
export const getSessionFromRequest = async (
  request: Request
): Promise<Session | null> => unsealSession(parseCookies(request)[COOKIE_NAME]);

/** Read and verify the current session from the ambient request cookies, or
 * `null`. Used by page server components / loaders via `unstable_getRequest()`. */
export const getSession = async (): Promise<Session | null> =>
  getSessionFromRequest(unstable_getRequest());
