import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { userSchema, type User } from "./types";

/**
 * Returns the user object of the requester's account. For OAuth2, this requires the `identify` scope, which will return the object without an email, and optionally the `email` scope, which returns the object with an email.
 *
 * https://discord.com/developers/docs/resources/user#get-current-user
 */
export const getCurrentUser: Fetcher<z.ZodUnknown, User> = async () =>
  get(`/users/@me`);

export const getCurrentUserProcedure = createProcedure(
  `query`,
  getCurrentUser,
  z.unknown(),
  userSchema
);
