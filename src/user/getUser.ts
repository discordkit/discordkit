import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { userSchema, type User } from "./types/User";

export const getUserSchema = z.object({
  user: z.string().min(1)
});

/**
 * Returns a user object for a given user ID.
 *
 * https://discord.com/developers/docs/resources/user#get-user
 */
export const getUser: Fetcher<typeof getUserSchema, User> = async ({ user }) =>
  get(`/users/${user}`);

export const getUserProcedure = toProcedure(
  `query`,
  getUser,
  getUserSchema,
  userSchema
);

export const getUserQuery = toQuery(getUser);
