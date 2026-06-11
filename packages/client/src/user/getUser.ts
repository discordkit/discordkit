import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { User } from "./types/User.js";

export const getUserSchema = v.object({
  user: snowflake
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
