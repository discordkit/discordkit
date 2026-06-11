import { getCurrentAuthorizationInfo } from "@discordkit/oauth";
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
  const info = await getCurrentAuthorizationInfo(session.accessToken);
  return Response.json(info);
};
