import { createFileRoute } from "@tanstack/react-router";
import { discord } from "#src/lib/discord";
import { getSession, clearSession } from "#src/lib/session";

/**
 * Log out: revoke the token at Discord (best-effort) and clear the session
 * cookie, then redirect to the public landing. Submitted as a plain <form>
 * POST from the dashboard, so it works without client JS (no hydration needed)
 * — the 303 redirect makes the browser navigate to `/` on its own.
 */
export const Route = createFileRoute(`/api/auth/logout`)({
  server: {
    handlers: {
      POST: async () => {
        const session = await getSession();
        if (session !== null) {
          try {
            await discord.revokeToken(
              session.refreshToken ?? session.accessToken
            );
          } catch {
            // Swallow — clearing the session below is what matters.
          }
        }
        clearSession();
        return new Response(null, { status: 303, headers: { Location: `/` } });
      }
    }
  }
});
