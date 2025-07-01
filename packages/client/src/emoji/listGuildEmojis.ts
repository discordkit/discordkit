import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { emojiSchema, type Emoji } from "./types/Emoji.js";

export const listGuildEmojisSchema = v.object({
  guild: snowflake
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

export const listGuildEmojisSafe = toValidated(
  listGuildEmojis,
  listGuildEmojisSchema,
  v.array(emojiSchema)
);

export const listGuildEmojisProcedure = toProcedure(
  `query`,
  listGuildEmojis,
  listGuildEmojisSchema,
  v.array(emojiSchema)
);

export const listGuildEmojisQuery = toQuery(listGuildEmojis);
