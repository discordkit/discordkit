import { z } from "zod";
import { mutation, remove } from "../utils";

export const removeGuildBanSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1)
});

/**
 * Remove the ban for a user. Requires the `BAN_MEMBERS` permissions. Returns a 204 empty response on success. Fires a [Guild Ban Remove](https://discord.com/developers/docs/topics/gateway#guild-ban-remove) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#remove-guild-ban
 */
export const removeGuildBan = mutation(
  removeGuildBanSchema,
  async ({ guild, user }) => remove(`/guilds/${guild}/bans/${user}`)
);
