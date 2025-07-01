import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { stickerSchema } from "./Sticker.js";

export const stickerPackSchema = v.object({
  /** id of the sticker pack */
  id: snowflake,
  /** the stickers in the pack */
  stickers: v.array(stickerSchema),
  /** name of the sticker pack */
  name: v.pipe(v.string(), v.nonEmpty()),
  /** id of the pack's SKU */
  skuId: snowflake,
  /** id of a sticker in the pack which is shown as the pack's icon */
  coverStickerId: v.exactOptional(snowflake),
  /** description of the sticker pack */
  description: v.pipe(v.string(), v.nonEmpty()),
  /** id of the sticker pack's banner image */
  bannerAssetId: v.exactOptional(snowflake)
});

export interface StickerPack extends v.InferOutput<typeof stickerPackSchema> {}
