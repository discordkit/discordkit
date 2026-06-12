import { getCurrentUserGuilds } from "@discordkit/client";
import { asCurrentUser } from "#src/lib/discord";

/**
 * Return the current user's guilds via `@discordkit/client`. Better Auth owns
 * the token; discordkit makes the authenticated call with it (`asCurrentUser`).
 * This is the two-packages-together payoff with a third-party auth framework.
 */
export const GET = async (): Promise<Response> => {
  const guilds = await asCurrentUser(async () => getCurrentUserGuilds({}));
  if (guilds === null) {
    return Response.json({ error: `Not authenticated` }, { status: 401 });
  }
  return Response.json(guilds);
};
