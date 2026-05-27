import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type Emoji } from "./types/Emoji.js";

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
