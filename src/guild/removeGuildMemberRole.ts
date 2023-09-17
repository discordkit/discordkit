import { z } from "zod";
import { mutation, remove } from "../utils";

export const removeGuildMemberRoleSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1),
  role: z.string().min(1)
});

/**
 * Removes a role from a guild member. Requires the `MANAGE_ROLES` permission. Returns a 204 empty response on success. Fires a [Guild Member Update](https://discord.com/developers/docs/topics/gateway#guild-member-update) Gateway event.
 *
 * *This endpoint supports the X-Audit-Log-Reason header.*
 *
 * https://discord.com/developers/docs/resources/guild#remove-guild-member-role
 */
export const removeGuildMemberRole = mutation(
  removeGuildMemberRoleSchema,
  async ({ guild, user, role }) =>
    remove(`/guilds/${guild}/members/${user}/roles/${role}`)
);
