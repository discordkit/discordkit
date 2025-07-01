import * as v from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asDigits,
  datauri
} from "@discordkit/core";
import { roleSchema, type Role } from "../permissions/Role.js";
import { permissionFlag } from "../permissions/Permissions.js";
import { roleColorsSchema } from "../permissions/RoleColors.js";

export const createGuildRoleSchema = v.object({
  guild: snowflake,
  body: v.partial(
    v.object({
      /** name of the role */
      name: v.pipe(v.string(), v.nonEmpty()),
      /** bitwise value of the enabled/disabled permissions */
      permissions: asDigits(permissionFlag) as v.GenericSchema<string>,
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
      hoist: v.boolean(),
      /** the role's icon image (if the guild has the `ROLE_ICONS` feature) */
      icon: v.nullable(datauri),
      /** the role's unicode emoji as a standard emoji (if the guild has the `ROLE_ICONS` feature) */
      unicodeEmoji: v.nullable(v.pipe(v.string(), v.nonEmpty())),
      /** whether the role should be mentionable */
      mentionable: v.boolean()
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
 * > [!NOTE]
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
