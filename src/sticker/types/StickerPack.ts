import type { Sticker } from "./Sticker";

// https://discord.com/developers/docs/resources/sticker#sticker-pack-object

export interface StickerPack {
  /** id of the sticker pack */
  id: string;
  /** the stickers in the pack */
  stickers: Sticker[];
  /** name of the sticker pack */
  name: string;
  /** id of the pack's SKU */
  skuId: string;
  /** id of a sticker in the pack which is shown as the pack's icon */
  coverStickerId?: string;
  /** description of the sticker pack */
  description: string;
  /** id of the sticker pack's banner image */
  bannerAssetId?: string;
}
