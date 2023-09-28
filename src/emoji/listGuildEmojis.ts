import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { emojiSchema, type Emoji } from "./types/Emoji.ts";

export const listGuildEmojisSchema = z.object({
  guild: z.string().min(1)
});

/**
 * ### [List Guild Emojis](https://discord.com/developers/docs/resources/emoji#list-guild-emojis)
 *
 * **GET** `/guilds/:guild/emojis`
 *
 * Returns a list of {@link Emoji | emoji objects} for the given guild.
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
