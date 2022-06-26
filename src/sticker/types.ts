import type { User } from "../user/types";

export interface Sticker {
  /** id of the sticker */
  id: string;
  /** for standard stickers, id of the pack the sticker is from */
  packId?: string;
  /** name of the sticker */
  name: string;
  /** description of the sticker */
  description?: string;
  /** autocomplete/suggestion tags for the sticker (max 200 characters) */
  tags: string;
  /** @deprecated previously the sticker asset hash, now an empty string */
  asset: string;
  /** type of sticker */
  type: StickerType;
  /** type of sticker format */
  formatType: StickerFormatType;
  /** whether this guild sticker can be used, may be false due to loss of Server Boosts */
  available?: boolean;
  /** id of the guild that owns this sticker */
  guildId?: string;
  /** the user that uploaded the guild sticker */
  user?: User;
  /** the standard sticker's sort order within its pack */
  sortValue?: number;
}

export enum StickerType {
  /** an official sticker in a pack, part of Nitro or in a removed purchasable pack */
  STANDARD = 1,
  /** a sticker uploaded to a Boosted guild for the guild's members */
  GUILD = 2
}

export enum StickerFormatType {
  PNG = 1,
  APNG = 2,
  LOTTIE = 3
}

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
