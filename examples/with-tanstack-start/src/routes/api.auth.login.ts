import { createFileRoute } from "@tanstack/react-router";
import { authHandler } from "#src/lib/discord";

// Server route: sets the CSRF state + PKCE cookies and redirects to Discord's
// consent screen. The @discordkit/oauth handler is a Web-standard
// (Request) => Response, so it drops straight into a TanStack Start handler.
export const Route = createFileRoute(`/api/auth/login`)({
  server: {
    handlers: {
      GET: async ({ request }) => authHandler.login(request)
    }
  }
});
