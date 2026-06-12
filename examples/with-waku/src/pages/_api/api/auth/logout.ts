import { discord } from "#src/lib/discord";
import { clearSessionSetCookie, getSessionFromRequest } from "#src/lib/session";

/**
 * Log out: revoke the token at Discord (best-effort) and clear the session
 * cookie, then redirect to the public landing. Submitted as a plain <form> POST
 * from the dashboard, so it works without client JS — the 303 redirect makes
 * the browser navigate to `/` on its own.
 */
export const POST = async (request: Request): Promise<Response> => {
  const session = await getSessionFromRequest(request);
  if (session !== null) {
    try {
      await discord.revokeToken(session.refreshToken ?? session.accessToken);
    } catch {
      // Swallow — clearing the session below is what matters.
    }
  }
  return new Response(null, {
    status: 303,
    headers: { Location: `/`, "Set-Cookie": clearSessionSetCookie() }
  });
};
