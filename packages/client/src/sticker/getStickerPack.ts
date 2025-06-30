import { object } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { stickerPackSchema, type StickerPack } from "./types/StickerPack.js";

export const getStickerPackSchema = object({
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

export const getStickerPackSafe = toValidated(
  getStickerPack,
  getStickerPackSchema,
  stickerPackSchema
);

export const getStickerPackProcedure = toProcedure(
  `query`,
  getStickerPack,
  getStickerPackSchema,
  stickerPackSchema
);

export const getStickerPackQuery = toQuery(getStickerPack);
