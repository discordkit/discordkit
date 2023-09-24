import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { stickerPackSchema } from "./types/StickerPack";

export const nitroStickerPacksSchema = z.object({
  stickerPacks: stickerPackSchema.array()
});

/**
 * Returns the list of sticker packs available to Nitro subscribers.
 *
 * https://discord.com/developers/docs/resources/sticker#list-nitro-sticker-packs
 */
export const listNitroStickerPacks: Fetcher<
  null,
  z.infer<typeof nitroStickerPacksSchema>
> = async () => get(`/sticker-packs`);

export const listNitroStickerPacksProcedure = toProcedure(
  `query`,
  listNitroStickerPacks,
  null,
  nitroStickerPacksSchema
);

export const listNitroStickerPacksQuery = toQuery(listNitroStickerPacks);
