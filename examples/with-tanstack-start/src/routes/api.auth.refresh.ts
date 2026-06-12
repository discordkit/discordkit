import { createFileRoute } from "@tanstack/react-router";
import { discord } from "#src/lib/discord";
import { getSession, setSession, sessionFromTokens } from "#src/lib/session";

/**
 * Refresh the access token using the stored refresh token and re-seal the
 * session, then redirect back to the dashboard. Submitted as a plain <form>
 * POST (no client JS needed); the 303 redirect to `/dashboard?refreshed`
 * re-renders with the confirmation. A dead refresh token → back to login.
 * A real app would refresh lazily near expiry (see lib/auth.ts).
 */
export const Route = createFileRoute(`/api/auth/refresh`)({
  server: {
    handlers: {
      POST: async () => {
        const session = await getSession();
        if (session?.refreshToken === undefined) {
          return new Response(null, {
            status: 303,
            headers: { Location: `/` }
          });
        }
        const tokens = await discord.refreshAccessToken(session.refreshToken);
        await setSession(sessionFromTokens(tokens));
        return new Response(null, {
          status: 303,
          headers: { Location: `/dashboard?refreshed` }
        });
      }
    }
  }
});
