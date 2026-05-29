import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type Sticker } from "./types/Sticker.js";

export const getGuildStickerSchema = v.object({
  guild: snowflake,
  sticker: snowflake
});

/**
 * ### [Get Guild Sticker](https://discord.com/developers/docs/resources/sticker#get-guild-sticker)
 *
 * **GET** `/guilds/:guild/stickers/:sticker`
 *
 * Returns a {@link Sticker | sticker object} for the given guild and sticker IDs. Includes the `user` field if the bot has the `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
 */
export const getGuildSticker: Fetcher<
  typeof getGuildStickerSchema,
  Sticker
> = async ({ guild, sticker }) => get(`/guilds/${guild}/stickers/${sticker}`);
