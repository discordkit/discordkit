import "server-only";
import { discord } from "./discord";
import {
  getSession,
  setSession,
  sessionFromTokens,
  type Session
} from "./session";

// Refresh the access token once it's within this window of expiring, so calls
// made just before expiry don't fail mid-flight. 60s is a comfortable margin
// for a short request.
const REFRESH_BUFFER_MS = 60_000;

/**
 * Read the session and transparently refresh the access token if it's expired
 * or about to. Returns a session whose `accessToken` is safe to use right now,
 * or `null` if the user isn't logged in (or the refresh failed).
 *
 * Lives outside `session.ts` so that module stays free of any dependency on the
 * Discord client (which itself depends on `session.ts` via `onSuccess`) — this
 * is the one place that composes the two.
 *
 * Must be called from a context where cookies can be written (Route Handlers,
 * Server Actions), since a refresh re-seals the session cookie.
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

  // Stale token. Without a refresh token there's nothing to do but treat the
  // user as logged out so they re-authenticate.
  if (session.refreshToken === undefined) {
    return null;
  }

  try {
    const tokens = await discord.refreshAccessToken(session.refreshToken);
    const refreshed = sessionFromTokens(tokens);
    await setSession(refreshed);
    return refreshed;
  } catch {
    // A failed refresh (revoked/expired refresh token) means the session can't
    // be salvaged — surface as logged-out rather than throwing.
    return null;
  }
};
