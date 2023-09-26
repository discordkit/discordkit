import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";

export const deleteGuildEmojiSchema = z.object({
  guild: z.string().min(1),
  emoji: z.string().min(1)
});

/**
 * ### [Delete Guild Emoji](https://discord.com/developers/docs/resources/emoji#delete-guild-emoji)
 *
 * **DELETE** `/guilds/:guild/emojis/:emoji`
 *
 * Delete the given emoji. Requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns `204 No Content` on success. Fires a Guild Emojis Update Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteGuildEmoji: Fetcher<typeof deleteGuildEmojiSchema> = async ({
  guild,
  emoji
}) => remove(`/guilds/${guild}/emojis/${emoji}`);

export const deleteGuildEmojiProcedure = toProcedure(
  `mutation`,
  deleteGuildEmoji,
  deleteGuildEmojiSchema
);
