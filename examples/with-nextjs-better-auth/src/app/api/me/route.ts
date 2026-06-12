import { getCurrentAuthorizationInfo } from "@discordkit/client";
import { asCurrentUser } from "#src/lib/discord";

/**
 * Return the current user's authorization info (`/oauth2/@me`) via discordkit.
 * The Discord bearer token is obtained from Better Auth server-side
 * (`asCurrentUser`) and never sent to the browser — the client only sees JSON.
 */
export const GET = async (): Promise<Response> => {
  const info = await asCurrentUser(async () => getCurrentAuthorizationInfo());
  if (info === null) {
    return Response.json({ error: `Not authenticated` }, { status: 401 });
  }
  return Response.json(info);
};
