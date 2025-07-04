import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteGuildEmojiSchema = v.object({
  guild: snowflake,
  emoji: snowflake
});

/**
 * ### [Delete Guild Emoji](https://discord.com/developers/docs/resources/emoji#delete-guild-emoji)
 *
 * **DELETE** `/guilds/:guild/emojis/:emoji`
 *
 * Delete the given emoji. Requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns `204 No Content` on success. Fires a Guild Emojis Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteGuildEmoji: Fetcher<typeof deleteGuildEmojiSchema> = async ({
  guild,
  emoji
}) => remove(`/guilds/${guild}/emojis/${emoji}`);

export const deleteGuildEmojiSafe = toValidated(
  deleteGuildEmoji,
  deleteGuildEmojiSchema
);

export const deleteGuildEmojiProcedure = toProcedure(
  `mutation`,
  deleteGuildEmoji,
  deleteGuildEmojiSchema
);
