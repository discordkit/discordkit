import "server-only";
import { headers } from "next/headers";
import { discord } from "@discordkit/core";
import { auth } from "#src/lib/auth";

/**
 * Run a discordkit call as the currently-signed-in user.
 *
 * This is the whole point of the example: Better Auth owns the OAuth flow and
 * stores the Discord tokens, so we ask it for a (fresh, auto-refreshed) Discord
 * access token via `auth.api.getAccessToken`, then scope it to the discordkit
 * `request` with `discord.asUser`. `using` clears the token at scope exit so it
 * can't leak into another request on a reused serverless instance.
 *
 * Returns `null` when there's no session or no linked Discord account — callers
 * treat that as "logged out".
 */
export const asCurrentUser = async <T>(
  fn: () => Promise<T>
): Promise<T | null> => {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (session === null) {
    return null;
  }

  // Better Auth reads the Discord token from its `account` table and refreshes
  // it if expired. providerId matches the social provider key in lib/auth.ts.
  // It throws (not returns null) if there's no linked Discord account, so treat
  // that as logged-out too.
  let accessToken: string;
  try {
    ({ accessToken } = await auth.api.getAccessToken({
      body: { providerId: `discord` },
      headers: requestHeaders
    }));
  } catch {
    return null;
  }

  using user = discord.asUser(accessToken);
  // Await before the `using` scope exits — otherwise asUser's disposal clears
  // the token before the request runs.
  return await user.request(fn);
};
