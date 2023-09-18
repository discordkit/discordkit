import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { User } from "./types";

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
