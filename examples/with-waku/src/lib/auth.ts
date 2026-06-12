import { discord } from "./discord.js";
import { getSession, sessionFromTokens, type Session } from "./session.js";

// Refresh the access token once it's within this window of expiring.
const REFRESH_BUFFER_MS = 60_000;

/**
 * Read the session and, if the access token is expired or about to be,
 * transparently refresh it — returning a session whose `accessToken` is safe to
 * use right now, or `null` if logged out (or the refresh failed).
 *
 * Note on persistence: in Waku a page server component / loader has no mutable
 * response to write the refreshed cookie to, so this returns the refreshed
 * session *for use in the current render only*. The `_api/auth/refresh` route
 * is what re-seals the cookie (it returns a Response). A production app would
 * typically refresh in middleware or a dedicated endpoint, then re-render.
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
    return sessionFromTokens(tokens);
  } catch {
    // A failed refresh means the session can't be salvaged — surface as logged out.
    return null;
  }
};
