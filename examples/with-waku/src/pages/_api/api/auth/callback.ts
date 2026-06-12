import { authHandler } from "#src/lib/discord";

// Discord redirects back here with `code` + `state`. The handler verifies the
// state (CSRF), exchanges the code (with PKCE), then runs onSuccess — which
// returns the redirect-to-/dashboard Response carrying the session cookie. The
// handler also clears the transient flow cookies on the way out.
export const GET = async (request: Request): Promise<Response> =>
  authHandler.callback(request);
