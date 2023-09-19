import { z } from "zod";
import { patch, type Fetcher, createProcedure } from "../utils";
import { roleSchema, type Role } from "./types";

export const modifyGuildRoleSchema = z.object({
  guild: z.string().min(1),
  role: z.string().min(1),
  body: z
    .object({
      /** name of the role */
      name: z.string().min(1).nullable(),
      /** bitwise value of the enabled/disabled permissions */
      permissions: z.string().min(1).nullable(),
      /** RGB color value */
      color: z.number().nullable(),
      /** whether the role should be displayed separately in the sidebar */
      hoist: z.boolean().nullable(),
      /** the role's icon image (if the guild has the `ROLE_ICONS` feature) */
      icon: z.string().min(1).nullable(),
      /** the role's unicode emoji as a standard emoji (if the guild has the `ROLE_ICONS` feature) */
      unicodeEmoji: z.string().min(1).nullable(),
      /** whether the role should be mentionable */
      mentionable: z.boolean().nullable()
    })
    .partial()
});

/**
 * Modify a guild role. Requires the `MANAGE_ROLES` permission. Returns the updated role on success. Fires a [Guild Role Update](https://discord.com/developers/docs/topics/gateway#guild-role-update) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#modify-guild-role
 */
export const modifyGuildRole: Fetcher<
  typeof modifyGuildRoleSchema,
  Role
> = async ({ guild, role, body }) =>
  patch(`/guilds/${guild}/roles/${role}`, body);

export const modifyGuildRoleProcedure = createProcedure(
  `mutation`,
  modifyGuildRole,
  modifyGuildRoleSchema,
  roleSchema
);
