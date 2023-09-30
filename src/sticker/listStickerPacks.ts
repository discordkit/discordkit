import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "#/utils/index.ts";
import { stickerPackSchema } from "./types/StickerPack.ts";

export const stickerPacksSchema = z.object({
  stickerPacks: stickerPackSchema.array()
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
  z.infer<typeof stickerPacksSchema>
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
