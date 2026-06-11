import { discord } from "#src/lib/discord";
import { getSession, clearSession } from "#src/lib/session";

/**
 * Log out: revoke the token at Discord (so it can't be reused) and clear the
 * session cookie. Best-effort revoke — even if Discord's revoke call fails, we
 * still clear the local session so the user is logged out client-side.
 */
export const POST = async (): Promise<Response> => {
  const session = await getSession();
  if (session !== null) {
    try {
      await discord.revokeToken(session.refreshToken ?? session.accessToken);
    } catch {
      // Swallow — clearing the session below is the part that matters to the user.
    }
  }
  await clearSession();
  return Response.json({ ok: true });
};
