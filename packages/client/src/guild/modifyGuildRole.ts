import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asDigits,
  datauri
} from "@discordkit/core";
import { roleSchema, type Role } from "../permissions/Role.js";
import { roleColorsSchema } from "../permissions/RoleColors.js";
import { permissionFlag } from "../permissions/Permissions.js";

export const modifyGuildRoleSchema = v.object({
  guild: snowflake,
  role: snowflake,
  body: v.partial(
    v.object({
      /** name of the role */
      name: v.nullish(v.pipe(v.string(), v.nonEmpty())),
      /** bitwise value of the enabled/disabled permissions */
      permissions: v.nullish(
        asDigits(permissionFlag) as v.GenericSchema<string>
      ),
      /** RGB color value */
      color: v.pipe(
        v.number(),
        v.integer(),
        v.minValue(0x000000),
        v.maxValue(0xffffff)
      ),
      /** the role's colors */
      colors: roleColorsSchema,
      /** whether the role should be displayed separately in the sidebar */
      hoist: v.nullish(v.boolean()),
      /** the role's icon image (if the guild has the `ROLE_ICONS` feature) */
      icon: v.nullish(datauri),
      /** the role's unicode emoji as a standard emoji (if the guild has the `ROLE_ICONS` feature) */
      unicodeEmoji: v.nullish(v.pipe(v.string(), v.nonEmpty())),
      /** whether the role should be mentionable */
      mentionable: v.nullish(v.boolean())
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
