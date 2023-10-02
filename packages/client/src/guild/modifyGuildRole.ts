import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { roleSchema, type Role } from "./types/Role.ts";

export const modifyGuildRoleSchema = z.object({
  guild: snowflake,
  role: snowflake,
  body: z
    .object({
      /** name of the role */
      name: z.string().min(1).nullish(),
      /** bitwise value of the enabled/disabled permissions */
      permissions: z.string().min(1).nullish(),
      /** RGB color value */
      color: z.number().int().nullish(),
      /** whether the role should be displayed separately in the sidebar */
      hoist: z.boolean().nullish(),
      /** the role's icon image (if the guild has the `ROLE_ICONS` feature) */
      icon: z.string().min(1).nullish(),
      /** the role's unicode emoji as a standard emoji (if the guild has the `ROLE_ICONS` feature) */
      unicodeEmoji: z.string().min(1).nullish(),
      /** whether the role should be mentionable */
      mentionable: z.boolean().nullish()
    })
    .partial()
});

/**
 * ### [Modify Guild Role](https://discord.com/developers/docs/resources/guild#modify-guild-role)
 *
 * **PATCH** `/guilds/:guild/roles/:role`
 *
 * Modify a guild role. Requires the `MANAGE_ROLES` permission. Returns the updated {@link Role | role} on success. Fires a Guild Role Update Gateway event.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional and nullable.
 *
 * > **NOTE**
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
