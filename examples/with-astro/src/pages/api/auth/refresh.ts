import type { APIRoute } from "astro";
import { discord } from "#src/lib/discord";
import { getSession, setSession, sessionFromTokens } from "#src/lib/session";

/**
 * Refresh the access token using the stored refresh token and re-seal the
 * session. Demonstrates the refresh half of the token lifecycle; a real app
 * would typically refresh lazily near expiry (see lib/auth.ts getValidSession).
 */
export const POST: APIRoute = async ({ cookies }) => {
  const session = await getSession(cookies);
  if (session?.refreshToken === undefined) {
    return Response.json(
      {
        error: `No refresh token is available, so the session can't be refreshed. Log in again to obtain a new one.`
      },
      { status: 401 }
    );
  }

  const tokens = await discord.refreshAccessToken(session.refreshToken);
  await setSession(cookies, sessionFromTokens(tokens));
  return Response.json({ expiresAt: Date.now() + tokens.expiresIn * 1000 });
};
