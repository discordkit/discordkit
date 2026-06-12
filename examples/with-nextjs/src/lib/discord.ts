import "server-only";
import { createOAuth2, createAuthHandler } from "@discordkit/oauth";
import { ENV } from "varlock/env";
import { setSession, sessionFromTokens } from "./session";

/**
 * The shared Discord OAuth2 client, configured from the (server-only)
 * environment. `server-only` + the `@sensitive` mark on `DISCORD_CLIENT_SECRET`
 * in `.env.schema` mean this module can't be imported into client code, so the
 * secret never reaches the browser.
 */
const config = {
  clientId: ENV.DISCORD_CLIENT_ID,
  clientSecret: ENV.DISCORD_CLIENT_SECRET,
  redirectUri: ENV.DISCORD_REDIRECT_URI
};

export const discord = createOAuth2(config);

/** The scopes this example requests: identify the user and list their guilds. */
export const SCOPES = [`identify`, `email`, `guilds`] as const;

/**
 * The login/callback handler pair, shared by both route handlers. `onSuccess`
 * is where this example plugs its own session persistence into the flow: it
 * seals the tokens into an httpOnly cookie, then lets the handler redirect.
 */
export const authHandler = createAuthHandler({
  ...config,
  scopes: [...SCOPES],
  // After login land on the protected dashboard (guarded by middleware.ts).
  successRedirect: `/dashboard`,
  onSuccess: async (tokens) => {
    await setSession(sessionFromTokens(tokens));
    return undefined;
  }
});
