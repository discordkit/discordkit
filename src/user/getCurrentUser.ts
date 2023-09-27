import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { userSchema, type User } from "./types/User";

/**
 * ### [Get Current User](https://discord.com/developers/docs/resources/user#get-current-user)
 *
 * **GET** `/users/@me`
 *
 * Returns the {@link User | user object} of the requester's account. For OAuth2, this requires the `identify` scope, which will return the object without an email, and optionally the `email` scope, which returns the object with an email.
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
