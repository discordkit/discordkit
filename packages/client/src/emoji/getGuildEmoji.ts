import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { Emoji } from "./types/Emoji.js";

export const getGuildEmojiSchema = v.object({
  guild: snowflake,
  emoji: snowflake
});

/**
 * ### [Get Guild Emoji](https://discord.com/developers/docs/resources/emoji#get-guild-emoji)
 *
 * **GET** `/guilds/:guild/emojis/:emoji`
 *
 * Returns an {@link Emoji | emoji object} for the given guild and emoji IDs. Includes the `user` field if the bot has the `MANAGE_GUILD_EXPRESSIONS` permission, or if the bot created the emoji and has the `CREATE_GUILD_EXPRESSIONS` permission.
 */
export const getGuildEmoji: Fetcher<
  typeof getGuildEmojiSchema,
  Emoji
> = async ({ guild, emoji }) => get(`/guilds/${guild}/emojis/${emoji}`);
