import {
  object,
  array,
  string,
  pipe,
  nonEmpty,
  exactOptional,
  type InferOutput
} from "valibot";
import { snowflake } from "@discordkit/core";
import { stickerSchema } from "./Sticker.js";

export const stickerPackSchema = object({
  /** id of the sticker pack */
  id: snowflake,
  /** the stickers in the pack */
  stickers: array(stickerSchema),
  /** name of the sticker pack */
  name: pipe(string(), nonEmpty()),
  /** id of the pack's SKU */
  skuId: snowflake,
  /** id of a sticker in the pack which is shown as the pack's icon */
  coverStickerId: exactOptional(snowflake),
  /** description of the sticker pack */
  description: pipe(string(), nonEmpty()),
  /** id of the sticker pack's banner image */
  bannerAssetId: exactOptional(snowflake)
});

export type StickerPack = InferOutput<typeof stickerPackSchema>;
