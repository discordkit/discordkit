import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { userSchema, type User } from "./types/User";

/**
 * Returns the user object of the requester's account. For OAuth2, this requires the `identify` scope, which will return the object without an email, and optionally the `email` scope, which returns the object with an email.
 *
 * https://discord.com/developers/docs/resources/user#get-current-user
 */
export const getCurrentUser: Fetcher<null, User> = async () =>
  get(`/users/@me`);

export const getCurrentUserProcedure = toProcedure(
  `query`,
  getCurrentUser,
  null,
  userSchema
);

export const getCurrentUserQuery = toQuery(getCurrentUser);
