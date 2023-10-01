import { z } from "zod";
import { stickerSchema } from "./Sticker.ts";

export const stickerPackSchema = z.object({
  /** id of the sticker pack */
  id: z.string(),
  /** the stickers in the pack */
  stickers: stickerSchema.array(),
  /** name of the sticker pack */
  name: z.string(),
  /** id of the pack's SKU */
  skuId: z.string(),
  /** id of a sticker in the pack which is shown as the pack's icon */
  coverStickerId: z.string().nullable(),
  /** description of the sticker pack */
  description: z.string(),
  /** id of the sticker pack's banner image */
  bannerAssetId: z.string().nullable()
});

export type StickerPack = z.infer<typeof stickerPackSchema>;
