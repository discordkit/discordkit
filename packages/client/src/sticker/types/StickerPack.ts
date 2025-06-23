import { object, array, string, nullish, type InferOutput } from "valibot";
import { snowflake } from "@discordkit/core";
import { stickerSchema } from "./Sticker.js";

export const stickerPackSchema = object({
  /** id of the sticker pack */
  id: snowflake,
  /** the stickers in the pack */
  stickers: array(stickerSchema),
  /** name of the sticker pack */
  name: string(),
  /** id of the pack's SKU */
  skuId: snowflake,
  /** id of a sticker in the pack which is shown as the pack's icon */
  coverStickerId: nullish(snowflake),
  /** description of the sticker pack */
  description: string(),
  /** id of the sticker pack's banner image */
  bannerAssetId: nullish(snowflake)
});

export type StickerPack = InferOutput<typeof stickerPackSchema>;
