import { get, type Fetcher } from "@discordkit/core/requests/methods";
import type { User } from "./types/User.js";

/**
 * ### [Get Current User](https://discord.com/developers/docs/resources/user#get-current-user)
 *
 * **GET** `/users/@me`
 *
 * Returns the {@link User | user object} of the requester's account. For OAuth2, this requires the `identify` scope, which will return the object *without* an email, and optionally the `email` scope, which returns the object *with* an email if the user has one.
 */
export const getCurrentUser: Fetcher<null, User> = async () =>
  get(`/users/@me`);
