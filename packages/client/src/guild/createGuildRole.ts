import {
  boolean,
  integer,
  minLength,
  number,
  object,
  optional,
  partial,
  string
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { roleSchema, type Role } from "./types/Role.js";

export const createGuildRoleSchema = object({
  guild: snowflake,
  body: partial(
    object({
      /** name of the role */
      name: string([minLength(1)]),
      /** bitwise value of the enabled/disabled permissions */
      permissions: number([integer()]),
      /** RGB color value */
      color: number([integer()]),
      /** whether the role should be displayed separately in the sidebar */
      hoist: boolean(),
      /** the role's icon image (if the guild has the `ROLE_ICONS` feature) */
      icon: optional(string([minLength(1)])),
      /** the role's unicode emoji as a standard emoji (if the guild has the `ROLE_ICONS` feature) */
      unicodeEmoji: optional(string([minLength(1)])),
      /** whether the role should be mentionable */
      mentionable: boolean()
    })
  )
});

/**
 * ### [Create Guild Role](https://discord.com/developers/docs/resources/guild#create-guild-role)
 *
 * **POST** `/guilds/:guild/roles`
 *
 * Create a new role for the guild. Requires the `MANAGE_ROLES` permission. Returns the new role object on success. Fires a Guild Role Create Gateway event. All JSON params are optional.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createGuildRole: Fetcher<
  typeof createGuildRoleSchema,
  Role
> = async ({ guild, body }) => post(`/guilds/${guild}/roles`, body);

export const createGuildRoleSafe = toValidated(
  createGuildRole,
  createGuildRoleSchema,
  roleSchema
);

export const createGuildRoleProcedure = toProcedure(
  `mutation`,
  createGuildRole,
  createGuildRoleSchema,
  roleSchema
);
