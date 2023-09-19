import { z } from "zod";
import { put, type Fetcher, createProcedure } from "../utils";

export const addGuildMemberRoleSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1),
  role: z.string().min(1)
});

/**
 * Adds a role to a guild member. Requires the `MANAGE_ROLES` permission. Returns a 204 empty response on success. Fires a [Guild Member Update](https://discord.com/developers/docs/topics/gateway#guild-member-update) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#add-guild-member-role
 */
export const addGuildMemberRole: Fetcher<
  typeof addGuildMemberRoleSchema
> = async ({ guild, user, role }) =>
  put(`/guilds/${guild}/members/${user}/roles/${role}`);

export const addGuildMemberRoleProcedure = createProcedure(
  `mutation`,
  addGuildMemberRole,
  addGuildMemberRoleSchema
);
