import { discord } from "#src/lib/discord";
import { getSession, setSession, sessionFromTokens } from "#src/lib/session";

/**
 * Refresh the access token using the stored refresh token, and re-seal the
 * session. Demonstrates the refresh half of the token lifecycle; a real app
 * would typically do this lazily when `expiresAt` is near rather than on
 * demand.
 */
export const POST = async (): Promise<Response> => {
  const session = await getSession();
  if (session?.refreshToken === undefined) {
    return Response.json(
      {
        error:
          `No refresh token is available, so the session can't be refreshed. ` +
          `Log in again to obtain a new one.`
      },
      { status: 401 }
    );
  }

  const tokens = await discord.refreshAccessToken(session.refreshToken);
  await setSession(sessionFromTokens(tokens));
  return Response.json({ expiresAt: Date.now() + tokens.expiresIn * 1000 });
};
