import { getCurrentAuthorizationInfo } from "@discordkit/client";
import { discord } from "@discordkit/core";
import { getValidSession } from "#src/lib/auth";

/**
 * Return the current user's authorization info (`/oauth2/@me`). The user's
 * bearer token is read from the server-side session and used to make the call;
 * it is never sent to the browser — the client only ever sees this JSON.
 *
 * `getValidSession` transparently refreshes the token if it's near expiry, so
 * this route never has to think about token lifetime.
 */
export const GET = async (): Promise<Response> => {
  const session = await getValidSession();
  if (session === null) {
    return Response.json({ error: `Not authenticated` }, { status: 401 });
  }
  using user = discord.asUser(session.accessToken);
  const info = await user.request(async () => getCurrentAuthorizationInfo());
  return Response.json(info);
};
