import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { emojiSchema, type Emoji } from "./types/Emoji";

export const listGuildEmojisSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of emoji objects for the given guild.
 *
 * https://discord.com/developers/docs/resources/emoji#list-guild-emojis
 */
export const listGuildEmojis: Fetcher<
  typeof listGuildEmojisSchema,
  Emoji[]
> = async ({ guild }) => get(`/guilds/${guild}/emojis`);

export const listGuildEmojisProcedure = toProcedure(
  `query`,
  listGuildEmojis,
  listGuildEmojisSchema,
  emojiSchema.array()
);

export const listGuildEmojisQuery = toQuery(listGuildEmojis);
