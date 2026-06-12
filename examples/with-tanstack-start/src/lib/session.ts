import { SignJWT, jwtVerify } from "jose";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { ENV } from "varlock/env";
import type { TokenResponse } from "@discordkit/oauth";
import { type Session, hasUsableSession } from "./session-shared.js";

// Re-export the client-safe surface so server code keeps a single import site.
// The runtime values themselves live in session-shared.ts (no secret), so
// route components can import them without dragging SESSION_SECRET clientward.
export { type Session, hasUsableSession };

/**
 * Stateless session management for the OAuth2 tokens: a signed JWT (`jose`)
 * stored in an httpOnly cookie. TanStack Start exposes `getCookie`/`setCookie`
 * (h3-based) that read/write the ambient request context, so these helpers — like
 * Next's `cookies()` — need no jar argument (they're called from server routes,
 * server functions, and loaders, all of which run server-side).
 *
 * Intentionally minimal to keep the example self-contained. For production,
 * prefer a dedicated auth library (Better Auth, Auth.js, Clerk, …).
 */

const COOKIE_NAME = `__Host-discord_session`;
const encodedKey = new TextEncoder().encode(ENV.SESSION_SECRET);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: `lax`,
  path: `/`
} as const;

/** Derive a {@link Session} from a fresh {@link TokenResponse}. */
export const sessionFromTokens = (tokens: TokenResponse): Session => ({
  accessToken: tokens.accessToken,
  ...(tokens.refreshToken === undefined
    ? {}
    : { refreshToken: tokens.refreshToken }),
  expiresAt: Date.now() + tokens.expiresIn * 1000
});

/** Sign the session into a compact JWS suitable for a cookie value. */
export const sealSession = async (session: Session): Promise<string> =>
  new SignJWT({ ...session })
    .setProtectedHeader({ alg: `HS256` })
    .setIssuedAt()
    .setExpirationTime(`7d`)
    .sign(encodedKey);

/** Verify and decode a session cookie value, or `null` if absent/invalid. */
export const unsealSession = async (
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

/** Build a `Set-Cookie` header value that persists the session — for the oauth
 * handler's `onSuccess`, which returns a Web-standard Response. */
export const sealSessionSetCookie = async (
  session: Session
): Promise<string> => {
  const value = await sealSession(session);
  return [
    `${COOKIE_NAME}=${value}`,
    `Path=${COOKIE_OPTIONS.path}`,
    `Max-Age=${60 * 60 * 24 * 7}`,
    `SameSite=Lax`,
    `HttpOnly`,
    `Secure`
  ].join(`; `);
};

/** Write the session to the response cookies (ambient request context). */
export const setSession = async (session: Session): Promise<void> => {
  setCookie(COOKIE_NAME, await sealSession(session), {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7
  });
};

/** Read and verify the current session, or `null` when logged out. */
export const getSession = async (): Promise<Session | null> =>
  unsealSession(getCookie(COOKIE_NAME));

/** Clear the session cookie (logout). Overwrite with matching attrs + maxAge 0
 * (a `__Host-` cookie won't delete unless the clearing cookie matches Secure/Path). */
export const clearSession = (): void => {
  setCookie(COOKIE_NAME, ``, { ...COOKIE_OPTIONS, maxAge: 0 });
};
