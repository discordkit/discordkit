import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { Emoji } from "./types/Emoji.js";

export const listGuildEmojisSchema = v.object({
  guild: snowflake
});

/**
 * ### [List Guild Emojis](https://discord.com/developers/docs/resources/emoji#list-guild-emojis)
 *
 * **GET** `/guilds/:guild/emojis`
 *
 * Returns a list of {@link Emoji | emoji objects} for the given guild. Includes `user` fields if the bot has the `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
 */
export const listGuildEmojis: Fetcher<
  typeof listGuildEmojisSchema,
  Emoji[]
> = async ({ guild }) => get(`/guilds/${guild}/emojis`);
