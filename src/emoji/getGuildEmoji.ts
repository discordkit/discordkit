import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { emojiSchema, type Emoji } from "./types";

export const getGuildEmojiSchema = z.object({
  guild: z.string().min(1),
  emoji: z.string().min(1)
});

/**
 * Returns an emoji object for the given guild and emoji IDs.
 *
 * https://discord.com/developers/docs/resources/emoji#get-guild-emoji
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
