import { z } from "zod";
import { mutation, remove } from "../utils";

export const removeGuildMemberSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1)
});

/**
 * Remove a member from a guild. Requires `KICK_MEMBERS` permission. Returns a 204 empty response on success. Fires a [Guild Member Remove](https://discord.com/developers/docs/topics/gateway#guild-member-remove) Gateway event.
 *
 * *This endpoint supports the X-Audit-Log-Reason header.*
 *
 * https://discord.com/developers/docs/resources/guild#remove-guild-member
 */
export const removeGuildMember = mutation(removeGuildMemberSchema, async ({ guild, user }) =>
  remove(`/guilds/${guild}/members/${user}`)
);
