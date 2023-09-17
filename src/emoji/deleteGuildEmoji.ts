import { z } from "zod";
import { mutation, remove } from "../utils";

export const deleteGuildEmojiSchema = z.object({
  guild: z.string().min(1),
  emoji: z.string().min(1)
});

/**
 * Delete the given emoji. Requires the `MANAGE_EMOJIS_AND_STICKERS` permission. Returns `204 No Content` on success. Fires a [Guild Emojis Update](https://discord.com/developers/docs/topics/gateway#guild-emojis-update) Gateway event
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 */
export const deleteGuildEmoji = mutation(
  deleteGuildEmojiSchema,
  async ({ guild, emoji }) => remove(`/guilds/${guild}/emojis/${emoji}`)
);
