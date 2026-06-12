import type { APIRoute } from "astro";
import { auth } from "#src/lib/discord";

// Sets the CSRF state + PKCE cookies and redirects the user to Discord's
// consent screen. The @discordkit/oauth/astro adapter handler is a Web-standard
// (APIContext) => Response, so it drops straight into an Astro endpoint.
export const GET: APIRoute = auth.login;
