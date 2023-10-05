import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { stickerSchema } from "./Sticker.js";

export const stickerPackSchema = z.object({
  /** id of the sticker pack */
  id: snowflake,
  /** the stickers in the pack */
  stickers: stickerSchema.array(),
  /** name of the sticker pack */
  name: z.string(),
  /** id of the pack's SKU */
  skuId: snowflake,
  /** id of a sticker in the pack which is shown as the pack's icon */
  coverStickerId: snowflake.nullish(),
  /** description of the sticker pack */
  description: z.string(),
  /** id of the sticker pack's banner image */
  bannerAssetId: snowflake.nullish()
});

export type StickerPack = z.infer<typeof stickerPackSchema>;
