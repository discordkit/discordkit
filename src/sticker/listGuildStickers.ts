import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { stickerSchema, type Sticker } from "./types";

export const listGuildStickersSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns an array of sticker objects for the given guild. Includes `user` fields if the bot has the `MANAGE_EMOJIS_AND_STICKERS` permission.
 *
 * https://discord.com/developers/docs/resources/sticker#list-guild-stickers
 */
export const listGuildStickers: Fetcher<
  typeof listGuildStickersSchema,
  Sticker[]
> = async ({ guild }) => get(`/guilds/${guild}/stickers`);

export const listGuildStickersProcedure = toProcedure(
  `query`,
  listGuildStickers,
  listGuildStickersSchema,
  stickerSchema.array()
);

export const listGuildStickersQuery = toQuery(listGuildStickers);
