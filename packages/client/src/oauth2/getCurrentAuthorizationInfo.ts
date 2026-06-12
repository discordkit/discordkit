import { get, type Fetcher } from "@discordkit/core/requests/methods";
import type { AuthorizationInfo } from "./types/AuthorizationInfo.js";

/**
 * ### [Get Current Authorization Information](https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information)
 *
 * **GET** `/oauth2/@me`
 *
 * Returns info about the current authorization. Requires authentication with a bearer token. The returned object includes the {@link AuthorizationInfo | application}, the `scopes` the user has authorized, when the access token `expires`, and — if the `identify` scope was authorized — the `user`.
 */
export const getCurrentAuthorizationInfo: Fetcher<
  null,
  AuthorizationInfo
> = async () => get(`/oauth2/@me`);
