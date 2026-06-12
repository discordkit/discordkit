import { SignJWT, jwtVerify } from "jose";
import type { AstroCookies } from "astro";
import { ENV } from "varlock/env";
import type { TokenResponse } from "@discordkit/oauth";

/**
 * Stateless session management for the OAuth2 tokens: a signed JWT (`jose`)
 * stored in an httpOnly cookie. Unlike the Next example (which reads a global
 * `cookies()`), Astro passes the cookie jar explicitly via `Astro.cookies` /
 * `context.cookies`, so every helper here takes an `AstroCookies`.
 *
 * Intentionally minimal to keep the example self-contained. For production,
 * prefer a dedicated auth library (Better Auth, Auth.js, Clerk, …) which
 * handles rotation, CSRF, and edge cases for you.
 */

const COOKIE_NAME = `__Host-discord_session`;
const encodedKey = new TextEncoder().encode(ENV.SESSION_SECRET);

/** Cookie attributes shared by set + clear; clearing must match to delete a `__Host-` cookie. */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: `lax`,
  path: `/`
} as const;

/** The data we persist between requests: just the tokens needed to call Discord. */
export interface Session {
  accessToken: string;
  refreshToken?: string;
  /** Epoch ms when the access token expires, derived from `expiresIn`. */
  expiresAt: number;
}

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
    // An invalid/expired/tampered cookie is treated as "no session" rather
    // than an error — the user is simply prompted to log in again.
    return null;
  }
};

/** Write the session to the cookie jar. */
export const setSession = async (
  cookies: AstroCookies,
  session: Session
): Promise<void> => {
  cookies.set(COOKIE_NAME, await sealSession(session), {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7
  });
};

/**
 * Build a `Set-Cookie` header value that persists the session — for contexts
 * that work with a raw `Response` rather than the `AstroCookies` jar (e.g. the
 * oauth handler's `onSuccess`, which returns a Web-standard Response).
 */
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

/** Read and verify the current session, or `null` when logged out. */
export const getSession = async (
  cookies: AstroCookies
): Promise<Session | null> => unsealSession(cookies.get(COOKIE_NAME)?.value);

/**
 * Whether the session looks usable for rendering the logged-in UI: it exists
 * and is either unexpired or has a refresh token (so the data routes can
 * refresh it). An expired session with no refresh token is treated as logged
 * out, preventing a stale cookie from pinning the user on an error-only view.
 */
export const hasUsableSession = (session: Session | null): boolean =>
  session !== null &&
  (session.expiresAt > Date.now() || session.refreshToken !== undefined);

/** Clear the session cookie (logout). */
export const clearSession = (cookies: AstroCookies): void => {
  // Overwrite with an expired, empty cookie carrying the SAME attributes used
  // to set it. The browser refuses to delete a `__Host-` cookie unless the
  // clearing cookie matches its `Secure` + `Path=/` attributes.
  cookies.set(COOKIE_NAME, ``, { ...COOKIE_OPTIONS, maxAge: 0 });
};
