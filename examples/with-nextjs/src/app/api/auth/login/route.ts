import { authHandler } from "#src/lib/discord";

// The oauth package's handler is a Web-standard (Request) => Response, which is
// exactly what a Next App Router Route Handler is — so we hand `login` straight
// to the `GET` export. It sets the CSRF state + PKCE cookies and redirects the
// user to Discord's consent screen.
export const GET = authHandler.login;
