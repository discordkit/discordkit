import { z } from "zod";
import { mutation, post } from "../utils";
import type { Role } from "./types";

export const createGuildRoleSchema = z.object({
  guild: z.string().min(1),
  body: z
    .object({
      /** name of the role */
      name: z.string().min(1),
      /** bitwise value of the enabled/disabled permissions */
      permissions: z.string().min(1),
      /** RGB color value */
      color: z.number(),
      /** whether the role should be displayed separately in the sidebar */
      hoist: z.boolean(),
      /** the role's icon image (if the guild has the `ROLE_ICONS` feature) */
      icon: z.string().min(1).nullable(),
      /** the role's unicode emoji as a standard emoji (if the guild has the `ROLE_ICONS` feature) */
      unicodeEmoji: z.string().min(1).nullable(),
      /** whether the role should be mentionable */
      mentionable: z.boolean()
    })
    .partial()
});

/**
 * Create a new role for the guild. Requires the `MANAGE_ROLES` permission. Returns the new role object on success. Fires a [Guild Role Create](https://discord.com/developers/docs/topics/gateway#guild-role-create) Gateway event. All JSON params are optional.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#create-guild-role
 */
export const createGuildRole = mutation(createGuildRoleSchema, async ({ guild, body }) =>
  post<Role>(`/guilds/${guild}/roles`, body)
);
