import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { stickerSchema, type Sticker } from "./types/Sticker.ts";

export const getGuildStickerSchema = z.object({
  guild: z.string().min(1),
  sticker: z.string().min(1)
});

/**
 * ### [Get Guild Sticker](https://discord.com/developers/docs/resources/sticker#get-guild-sticker)
 *
 * **GET** `/guilds/:guild/stickers/:sticker`
 *
 * Returns a {@link Sticker | sticker object} for the given guild and sticker IDs. Includes the `user` field if the bot has the `MANAGE_GUILD_EXPRESSIONS` permission.
 */
export const getGuildSticker: Fetcher<
  typeof getGuildStickerSchema,
  Sticker
> = async ({ guild, sticker }) => get(`/guilds/${guild}/stickers/${sticker}`);

export const getGuildStickerProcedure = toProcedure(
  `query`,
  getGuildSticker,
  getGuildStickerSchema,
  stickerSchema
);

export const getGuildStickerQuery = toQuery(getGuildSticker);
