import { object, array, type InferOutput } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "@discordkit/core";
import { stickerPackSchema } from "./types/StickerPack.js";

export const stickerPacksSchema = object({
  stickerPacks: array(stickerPackSchema)
});

/**
 * ### [List Sticker Packs](https://discord.com/developers/docs/resources/sticker#list-sticker-packs)
 *
 * **GET** `/sticker-packs`
 *
 * Returns a list of available sticker packs.
 */
export const listStickerPacks: Fetcher<
  null,
  InferOutput<typeof stickerPacksSchema>
> = async () => get(`/sticker-packs`);

export const listStickerPacksSafe = toValidated(
  listStickerPacks,
  null,
  stickerPacksSchema
);

export const listStickerPacksProcedure = toProcedure(
  `query`,
  listStickerPacks,
  null,
  stickerPacksSchema
);

export const listStickerPacksQuery = toQuery(listStickerPacks);
