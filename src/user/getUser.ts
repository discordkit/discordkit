import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { userSchema, type User } from "./types/User";

export const getUserSchema = z.object({
  user: z.string().min(1)
});

/**
 * ### [Get User](https://discord.com/developers/docs/resources/user#get-user)
 *
 * **GET** `/users/:user`
 *
 * Returns a {@link User | user object} for a given user ID.
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
