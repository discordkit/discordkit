import * as v from "valibot";
import { remove, type Fetcher, snowflake } from "@discordkit/core";

export const deleteGuildEmojiSchema = v.object({
  guild: snowflake,
  emoji: snowflake
});

/**
 * ### [Delete Guild Emoji](https://discord.com/developers/docs/resources/emoji#delete-guild-emoji)
 *
 * **DELETE** `/guilds/:guild/emojis/:emoji`
 *
 * Delete the given emoji. For emojis created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission. For other emojis, requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns `204 No Content` on success. Fires a Guild Emojis Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteGuildEmoji: Fetcher<
  typeof deleteGuildEmojiSchema,
  void,
  { auditLogReason: true }
> = async ({ guild, emoji }, options) =>
  remove(`/guilds/${guild}/emojis/${emoji}`, options);
