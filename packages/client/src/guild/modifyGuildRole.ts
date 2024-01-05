import {
  boolean,
  integer,
  minLength,
  nullish,
  number,
  object,
  partial,
  string
} from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { roleSchema, type Role } from "./types/Role.js";

export const modifyGuildRoleSchema = object({
  guild: snowflake,
  role: snowflake,
  body: partial(
    object({
      /** name of the role */
      name: nullish(string([minLength(1)])),
      /** bitwise value of the enabled/disabled permissions */
      permissions: nullish(string([minLength(1)])),
      /** RGB color value */
      color: nullish(number([integer()])),
      /** whether the role should be displayed separately in the sidebar */
      hoist: nullish(boolean()),
      /** the role's icon image (if the guild has the `ROLE_ICONS` feature) */
      icon: nullish(string([minLength(1)])),
      /** the role's unicode emoji as a standard emoji (if the guild has the `ROLE_ICONS` feature) */
      unicodeEmoji: nullish(string([minLength(1)])),
      /** whether the role should be mentionable */
      mentionable: nullish(boolean())
    })
  )
});

/**
 * ### [Modify Guild Role](https://discord.com/developers/docs/resources/guild#modify-guild-role)
 *
 * **PATCH** `/guilds/:guild/roles/:role`
 *
 * Modify a guild role. Requires the `MANAGE_ROLES` permission. Returns the updated {@link Role | role} on success. Fires a Guild Role Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional and nullable.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildRole: Fetcher<
  typeof modifyGuildRoleSchema,
  Role
> = async ({ guild, role, body }) =>
  patch(`/guilds/${guild}/roles/${role}`, body);

export const modifyGuildRoleSafe = toValidated(
  modifyGuildRole,
  modifyGuildRoleSchema,
  roleSchema
);

export const modifyGuildRoleProcedure = toProcedure(
  `mutation`,
  modifyGuildRole,
  modifyGuildRoleSchema,
  roleSchema
);
