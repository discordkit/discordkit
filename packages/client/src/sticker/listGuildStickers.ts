import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type Sticker } from "./types/Sticker.js";

export const listGuildStickersSchema = v.object({
  guild: snowflake
});

/**
 * ### [List Guild Stickers](https://discord.com/developers/docs/resources/sticker#list-guild-stickers)
 *
 * **GET** `/guilds/:guild/stickers`
 *
 * Returns an array of {@link Sticker | sticker objects} for the given guild. Includes `user` fields if the bot has the `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
 */
export const listGuildStickers: Fetcher<
  typeof listGuildStickersSchema,
  Sticker[]
> = async ({ guild }) => get(`/guilds/${guild}/stickers`);
