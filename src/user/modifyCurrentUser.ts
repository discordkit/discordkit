import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import { userSchema, type User } from "./types/User";

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

export const modifyCurrentUserProcedure = toProcedure(
  `mutation`,
  modifyCurrentUser,
  modifyCurrentUserSchema,
  userSchema
);
