import { createOAuth2, createAuthHandler } from "@discordkit/oauth";
import { ENV } from "varlock/env";
import { setSession, sessionFromTokens } from "./session";

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
 * The login/callback handlers, shared by the auth server routes. TanStack
 * Start's `setCookie` works in the handler's server context, so `onSuccess`
 * persists the session directly (the handler then redirects to successRedirect).
 */
export const authHandler = createAuthHandler({
  ...config,
  scopes: [...SCOPES],
  // After login land on the protected dashboard (guarded by beforeLoad).
  successRedirect: `/dashboard`,
  onSuccess: async (tokens) => {
    await setSession(sessionFromTokens(tokens));
    return undefined;
  }
});
