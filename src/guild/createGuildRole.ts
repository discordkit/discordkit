import { z } from "zod";
import { post, type Fetcher, toProcedure } from "#/utils/index.ts";
import { roleSchema, type Role } from "./types/Role.ts";

export const createGuildRoleSchema = z.object({
  guild: z.string().min(1),
  body: z
    .object({
      /** name of the role */
      name: z.string().min(1),
      /** bitwise value of the enabled/disabled permissions */
      permissions: z.string().min(1),
      /** RGB color value */
      color: z.number().int(),
      /** whether the role should be displayed separately in the sidebar */
      hoist: z.boolean(),
      /** the role's icon image (if the guild has the `ROLE_ICONS` feature) */
      icon: z.string().min(1).optional(),
      /** the role's unicode emoji as a standard emoji (if the guild has the `ROLE_ICONS` feature) */
      unicodeEmoji: z.string().min(1).optional(),
      /** whether the role should be mentionable */
      mentionable: z.boolean()
    })
    .partial()
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

export const createGuildRoleProcedure = toProcedure(
  `mutation`,
  createGuildRole,
  createGuildRoleSchema,
  roleSchema
);
