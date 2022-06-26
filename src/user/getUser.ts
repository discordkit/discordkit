import { z } from "zod";
import type { User } from "./types";
import { get, query } from "../utils";

export const getUserSchema = z.object({
  user: z.string().min(1)
});

/**
 * Returns a user object for a given user ID.
 *
 * https://discord.com/developers/docs/resources/user#get-user
 */
export const getUser = query(getUserSchema, ({ user }) => get<User>(`/users/${user}`));
