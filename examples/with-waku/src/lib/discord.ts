import { createOAuth2, createAuthHandler } from "@discordkit/oauth";
import { ENV } from "varlock/env";
import { sealSessionSetCookie, sessionFromTokens } from "./session.js";

/**
 * The Discord OAuth2 config, from the environment. The `@sensitive` mark on
 * `DISCORD_CLIENT_SECRET` in `.env.schema` makes Varlock error if it's accessed
 * from client code, so the secret stays server-side.
 */
const config = {
  clientId: ENV.DISCORD_CLIENT_ID,
  clientSecret: ENV.DISCORD_CLIENT_SECRET,
  redirectUri: ENV.DISCORD_REDIRECT_URI
};

/** Low-level client, used for the refresh + per-user (asUser) data calls. */
export const discord = createOAuth2(config);

/** The scopes this example requests: identify the user and list their guilds. */
export const SCOPES = [`identify`, `email`, `guilds`] as const;

/**
 * The login/callback handlers, mounted by the `_api/auth/*` routes. Waku has no
 * ambient response to set cookies on, so `onSuccess` *returns a Response* that
 * carries the session `Set-Cookie` and redirects to the dashboard. The handler
 * then merges in its own state/PKCE-cookie-clearing headers (see handler.ts).
 */
export const authHandler = createAuthHandler({
  ...config,
  scopes: [...SCOPES],
  successRedirect: `/dashboard`,
  onSuccess: async (tokens) =>
    new Response(null, {
      status: 302,
      headers: {
        Location: `/dashboard`,
        "Set-Cookie": await sealSessionSetCookie(sessionFromTokens(tokens))
      }
    })
});
