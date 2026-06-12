import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ENV } from "varlock/env";
import type { TokenResponse } from "@discordkit/oauth";

/**
 * Stateless session management for the OAuth2 tokens, following the official
 * Next.js guidance (https://nextjs.org/docs/app/guides/authentication): the
 * session is a signed JWT (`jose`) stored in an httpOnly cookie. `server-only`
 * guarantees this module — and the `SESSION_SECRET` it reads — can never be
 * bundled into client code.
 *
 * This is intentionally minimal to keep the example self-contained. For a
 * production app, prefer a dedicated auth library (Better Auth, Auth.js,
 * Clerk, …) which handles rotation, CSRF, and edge cases for you.
 */

const COOKIE_NAME = `__Host-discord_session`;
const encodedKey = new TextEncoder().encode(ENV.SESSION_SECRET);

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
export const setSession = async (session: Session): Promise<void> => {
  const store = await cookies();
  store.set(COOKIE_NAME, await sealSession(session), {
    httpOnly: true,
    secure: true,
    sameSite: `lax`,
    path: `/`,
    maxAge: 60 * 60 * 24 * 7
  });
};

/** Read and verify the current session, or `null` when logged out. */
export const getSession = async (): Promise<Session | null> => {
  const store = await cookies();
  return unsealSession(store.get(COOKIE_NAME)?.value);
};

/**
 * Whether the session looks usable for rendering the logged-in UI. True when a
 * session exists and is either unexpired or has a refresh token (so the data
 * routes can refresh it). An expired session with no refresh token is treated
 * as logged-out — this is what a Server Component can decide without writing
 * cookies, and it prevents an expired cookie from pinning the user on a
 * dashboard that can only error.
 */
export const hasUsableSession = async (): Promise<boolean> => {
  const session = await getSession();
  if (session === null) {
    return false;
  }
  return session.expiresAt > Date.now() || session.refreshToken !== undefined;
};

/** Clear the session cookie (logout). */
export const clearSession = async (): Promise<void> => {
  const store = await cookies();
  // Overwrite with an expired, empty cookie carrying the SAME attributes used
  // to set it. A bare `store.delete(name)` does NOT replay `Secure`/`Path`,
  // and the browser refuses to delete a `__Host-` cookie unless the clearing
  // `Set-Cookie` matches its `Secure` + `Path=/` (+ no Domain) attributes — so
  // `.delete()` silently leaves the session cookie in place, keeping the user
  // "logged in" until they manually clear site data.
  store.set(COOKIE_NAME, ``, {
    httpOnly: true,
    secure: true,
    sameSite: `lax`,
    path: `/`,
    maxAge: 0
  });
};
