import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core";
import { stickerPackSchema } from "./types/StickerPack.js";

export const stickerPacksSchema = v.object({
  stickerPacks: v.array(stickerPackSchema)
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
  v.InferOutput<typeof stickerPacksSchema>
> = async () => get(`/sticker-packs`);
