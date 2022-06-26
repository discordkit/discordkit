import type { User } from "./types";
import type { Fetcher } from "../utils";
import { get } from "../utils";

/**
 * Returns the user object of the requester's account. For OAuth2, this requires the `identify` scope, which will return the object without an email, and optionally the `email` scope, which returns the object with an email.
 *
 * https://discord.com/developers/docs/resources/user#get-current-user
 */
export const getCurrentUser = (): Fetcher<User> => get(`/users/@me`);
