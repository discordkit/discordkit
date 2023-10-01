import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { stickerSchema, type Sticker } from "./types/Sticker.ts";

export const getStickerSchema = z.object({
  sticker: snowflake
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

export const getStickerSafe = toValidated(
  getSticker,
  getStickerSchema,
  stickerSchema
);

export const getStickerProcedure = toProcedure(
  `query`,
  getSticker,
  getStickerSchema,
  stickerSchema
);

export const getStickerQuery = toQuery(getSticker);
