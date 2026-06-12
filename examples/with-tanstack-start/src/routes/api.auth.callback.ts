import { createFileRoute } from "@tanstack/react-router";
import { authHandler } from "#src/lib/discord";

// Discord redirects back here with `code` + `state`. The handler verifies the
// state (CSRF), exchanges the code (with PKCE), runs onSuccess to seal the
// session cookie, clears the transient flow cookies, and redirects to /dashboard.
export const Route = createFileRoute(`/api/auth/callback`)({
  server: {
    handlers: {
      GET: async ({ request }) => authHandler.callback(request)
    }
  }
});
