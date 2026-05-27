import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type Emoji } from "./types/Emoji.js";

export const getGuildEmojiSchema = v.object({
  guild: snowflake,
  emoji: snowflake
});

/**
 * ### [Get Guild Emoji](https://discord.com/developers/docs/resources/emoji#get-guild-emoji)
 *
 * **GET** `/guilds/:guild/emojis/:emoji`
 *
 * Returns an {@link Emoji | emoji object} for the given guild and emoji IDs.
 */
export const getGuildEmoji: Fetcher<
  typeof getGuildEmojiSchema,
  Emoji
> = async ({ guild, emoji }) => get(`/guilds/${guild}/emojis/${emoji}`);
