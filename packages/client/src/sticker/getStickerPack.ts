import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type StickerPack } from "./types/StickerPack.js";

export const getStickerPackSchema = v.object({
  pack: snowflake
});

/**
 * ### [Get Sticker Pack](https://discord.com/developers/docs/resources/sticker#get-sticker-pack)
 *
 * **GET** `/sticker-packs/:pack`
 *
 * Returns a sticker pack object for the given sticker pack ID.
 */
export const getStickerPack: Fetcher<
  typeof getStickerPackSchema,
  StickerPack
> = async ({ pack }) => get(`/sticker-packs/${pack}`);
