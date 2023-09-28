import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { emojiSchema, type Emoji } from "./types/Emoji.ts";

export const getGuildEmojiSchema = z.object({
  guild: z.string().min(1),
  emoji: z.string().min(1)
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

export const getGuildEmojiProcedure = toProcedure(
  `query`,
  getGuildEmoji,
  getGuildEmojiSchema,
  emojiSchema
);

export const getGuildEmojiQuery = toQuery(getGuildEmoji);
