import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { stickerSchema, type Sticker } from "./types/Sticker";

export const getStickerSchema = z.object({
  sticker: z.string().min(1)
});

/**
 * ### [Get Sticker](https://discord.com/developers/docs/resources/sticker#get-sticker)
 *
 * **GET** `/stickers/:sticker`
 *
 * Returns a {@link Sticker | sticker object} for the given sticker ID.
 */
export const getSticker: Fetcher<typeof getStickerSchema, Sticker> = async ({
  sticker
}) => get(`/stickers/${sticker}`);

export const getStickerProcedure = toProcedure(
  `query`,
  getSticker,
  getStickerSchema,
  stickerSchema
);

export const getStickerQuery = toQuery(getSticker);
