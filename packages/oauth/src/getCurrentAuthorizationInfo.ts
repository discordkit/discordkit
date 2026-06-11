import type {
  AuthorizationInfo,
  AuthorizedApplication,
  AuthorizedUser
} from "./types/AuthorizationInfo.js";
import type { OAuth2Scope } from "./types/OAuth2Scope.js";

const AUTH_INFO_URL = `https://discord.com/api/oauth2/@me`;

/** The raw `/oauth2/@me` payload, in Discord's original shape. */
interface RawAuthorizationInfo {
  application: AuthorizedApplication;
  scopes: OAuth2Scope[];
  expires: string;
  user?: AuthorizedUser;
}

/**
 * Fetch the current authorization information for a user access token —
 * `GET /oauth2/@me`. Tells you which application the token was issued for,
 * the scopes the user granted, when it expires, and (if the `identify` scope
 * was granted) the authorizing user.
 *
 * Takes the user's `Bearer` access token directly rather than reading a
 * global session — this is a per-user introspection call, and the token is
 * whatever you obtained from {@link createOAuth2}'s flow. The call goes
 * straight to `fetch`, like the rest of this package.
 *
 * @param accessToken - The user's OAuth2 access token (without the `Bearer ` prefix).
 *
 * @example
 * ```ts
 * const tokens = await discord.validateAuthorizationCode(code);
 * const info = await getCurrentAuthorizationInfo(tokens.accessToken);
 * console.log(info.user?.username, info.scopes);
 * ```
 */
export const getCurrentAuthorizationInfo = async (
  accessToken: string
): Promise<AuthorizationInfo> => {
  const response = await fetch(AUTH_INFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: `application/json`
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Couldn't read the authorization info from /oauth2/@me (HTTP ${response.status}). ` +
        `This usually means the access token is expired or invalid. ` +
        `To fix: refresh it with refreshAccessToken, or send the user back ` +
        `through the login flow to obtain a new one.${
          body.length === 0 ? `` : ` Discord said: ${body}`
        }`
    );
  }

  const raw: RawAuthorizationInfo = await response.json();
  return {
    application: raw.application,
    scopes: raw.scopes,
    expires: raw.expires,
    ...(raw.user === undefined ? {} : { user: raw.user })
  };
};
