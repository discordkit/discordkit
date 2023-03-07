import type { User } from "../../user";
import type { StickerFormatType } from "./StickerFormatType";
import type { StickerType } from "./StickerType";

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
