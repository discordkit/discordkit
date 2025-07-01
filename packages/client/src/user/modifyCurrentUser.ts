import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  datauri
} from "@discordkit/core";
import { userSchema, type User } from "./types/User.js";

export const modifyCurrentUserSchema = v.object({
  body: v.partial(
    v.object({
      /** user's username, if changed may cause the user's discriminator to be randomized. */
      username: v.pipe(v.string(), v.nonEmpty()),
      /** if passed, modifies the user's avatar */
      avatar: v.nullable(datauri),
      /** if passed, modifies the user's banner */
      banner: v.nullable(datauri)
    })
  )
});

/**
 * ### [Modify Current User](https://discord.com/developers/docs/resources/user#modify-current-user)
 *
 * **PATCH** `/users/@me`
 *
 * Modify the requester's user account settings. Returns a {@link User | user object} on success. Fires a User Update Gateway event.
 *
 * > [!NOTE]
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
