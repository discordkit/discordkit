import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { stickerSchema, type Sticker } from "./types";

export const getGuildStickerSchema = z.object({
  guild: z.string().min(1),
  sticker: z.string().min(1)
});

/**
 * Returns a sticker object for the given guild and sticker IDs. Includes the `user` field if the bot has the `MANAGE_EMOJIS_AND_STICKERS` permission.
 *
 * https://discord.com/developers/docs/resources/sticker#get-guild-sticker
 */
export const getGuildSticker: Fetcher<
  typeof getGuildStickerSchema,
  Sticker
> = async ({ guild, sticker }) => get(`/guilds/${guild}/stickers/${sticker}`);

export const getGuildStickerProcedure = createProcedure(
  `query`,
  getGuildSticker,
  getGuildStickerSchema,
  stickerSchema
);
