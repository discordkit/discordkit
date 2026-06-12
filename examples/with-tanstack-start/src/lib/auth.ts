import { discord } from "./discord";
import {
  getSession,
  setSession,
  sessionFromTokens,
  type Session
} from "./session";

// Refresh the access token once it's within this window of expiring.
const REFRESH_BUFFER_MS = 60_000;

/**
 * Read the session and transparently refresh the access token if it's expired
 * or about to. Returns a session whose `accessToken` is safe to use right now,
 * or `null` if the user isn't logged in (or the refresh failed).
 *
 * Uses the ambient request cookies (TanStack Start), so call it server-side —
 * from a route `beforeLoad`/`loader` or a server route. A refresh re-seals the
 * cookie.
 */
export const getValidSession = async (): Promise<Session | null> => {
  const session = await getSession();
  if (session === null) {
    return null;
  }

  const isStale = session.expiresAt - Date.now() <= REFRESH_BUFFER_MS;
  if (!isStale) {
    return session;
  }

  if (session.refreshToken === undefined) {
    return null;
  }

  try {
    const tokens = await discord.refreshAccessToken(session.refreshToken);
    const refreshed = sessionFromTokens(tokens);
    await setSession(refreshed);
    return refreshed;
  } catch {
    // A failed refresh means the session can't be salvaged — surface as logged out.
    return null;
  }
};
