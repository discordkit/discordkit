import type { APIRoute } from "astro";
import { discord } from "#src/lib/discord";
import { getSession, clearSession } from "#src/lib/session";

/**
 * Log out: revoke the token at Discord (best-effort) and clear the session
 * cookie. Even if the revoke call fails, clearing the cookie below logs the
 * user out locally.
 */
export const POST: APIRoute = async ({ cookies }) => {
  const session = await getSession(cookies);
  if (session !== null) {
    try {
      await discord.revokeToken(session.refreshToken ?? session.accessToken);
    } catch {
      // Swallow — clearing the session below is what matters to the user.
    }
  }
  clearSession(cookies);
  return Response.json({ ok: true });
};
