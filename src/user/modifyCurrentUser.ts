import { z } from "zod";
import { patch, type Fetcher } from "../utils";
import type { User } from "./types";

export const modifyCurrentUserSchema = z.object({
  body: z
    .object({
      /** user's username, if changed may cause the user's discriminator to be randomized. */
      username: z.string(),
      /** if passed, modifies the user's avatar */
      avatar: z.string()
    })
    .partial()
});

/**
 * Modify the requester's user account settings. Returns a user object on success.
 *
 * https://discord.com/developers/docs/resources/user#modify-current-user
 */
export const modifyCurrentUser: Fetcher<
  typeof modifyCurrentUserSchema,
  User
> = async ({ body }) => patch(`/users/@me`, body);
