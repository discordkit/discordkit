import { authHandler } from "#src/lib/discord";

// Start the flow: the @discordkit/oauth handler sets the CSRF state + PKCE
// cookies and 302s to Discord's consent screen. It's a Web-standard
// (Request) => Response, so the Waku API route is a one-liner — no adapter.
export const GET = async (request: Request): Promise<Response> =>
  authHandler.login(request);
