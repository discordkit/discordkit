import { getCurrentUserGuilds } from "@discordkit/client";
import { discord } from "@discordkit/core";
import { getValidSession } from "#src/lib/auth";

/**
 * Return the current user's guilds via `@discordkit/client`. This shows the two
 * packages working together: the OAuth flow yields a user access token, and the
 * client Fetcher makes the authenticated call with it.
 *
 * `discord.asUser(token)` returns a disposable that scopes the user's token to
 * `request(...)`; `using` clears it at scope exit so it can't leak into a later
 * request on a reused serverless instance.
 */
export const GET = async (): Promise<Response> => {
  const session = await getValidSession();
  if (session === null) {
    return Response.json({ error: `Not authenticated` }, { status: 401 });
  }
  using user = discord.asUser(session.accessToken);
  const guilds = await user.request(async () => getCurrentUserGuilds({}));
  return Response.json(guilds);
};
