import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated
} from "#/utils/index.ts";
import { userSchema, type User } from "./types/User.ts";

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
 * ### [Modify Current User](https://discord.com/developers/docs/resources/user#modify-current-user)
 *
 * **PATCH** `/users/@me`
 *
 * Modify the requester's user account settings. Returns a {@link User | user object} on success. Fires a User Update Gateway event.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional.
 */
export const modifyCurrentUser: Fetcher<
  typeof modifyCurrentUserSchema,
  User
> = async ({ body }) => patch(`/users/@me`, body);

export const modifyCurrentUserSafe = toValidated(
  modifyCurrentUser,
  modifyCurrentUserSchema,
  userSchema
);

export const modifyCurrentUserProcedure = toProcedure(
  `mutation`,
  modifyCurrentUser,
  modifyCurrentUserSchema,
  userSchema
);
