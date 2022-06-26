import { z } from "zod";
import { get, query } from "../utils";
import type { Emoji } from "./types";

export const getGuildEmojiSchema = z.object({
  guild: z.string().min(1),
  emoji: z.string().min(1)
});

/**
 * Returns an emoji object for the given guild and emoji IDs.
 *
 * https://discord.com/developers/docs/resources/emoji#get-guild-emoji
 */
export const getGuildEmoji = query(getGuildEmojiSchema, ({ guild, emoji }) =>
  get<Emoji>(`/guilds/${guild}/emojis/${emoji}`)
);
