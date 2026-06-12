import { createOAuth2 } from "@discordkit/oauth";
import { createDiscordAuth } from "@discordkit/oauth/astro";
import { ENV } from "varlock/env";
import { sealSessionSetCookie, sessionFromTokens } from "./session";

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
 * The login + callback Astro endpoints, from `@discordkit/oauth/astro`. The
 * adapter wraps the shared Web-standard handler for Astro's `APIContext`.
 * `onSuccess` persists the session by returning the success redirect with a
 * sealed-session `Set-Cookie` — the handler merges in its own cookie-clearing
 * headers (the transient state/PKCE cookies) automatically.
 */
export const auth = createDiscordAuth({
  ...config,
  scopes: [...SCOPES],
  // After login land on the protected dashboard (guarded by src/middleware.ts).
  successRedirect: `/dashboard`,
  onSuccess: async (tokens) =>
    // The session Set-Cookie lands with this redirect, so the subsequent
    // /dashboard navigation passes the middleware's session check.
    new Response(null, {
      status: 302,
      headers: {
        Location: `/dashboard`,
        "Set-Cookie": await sealSessionSetCookie(sessionFromTokens(tokens))
      }
    })
});
