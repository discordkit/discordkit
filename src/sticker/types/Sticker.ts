import { z } from "zod";
import { user } from "../../user";
import { stickerFormatType } from "./StickerFormatType";
import { stickerType } from "./StickerType";

export const sticker = z.object({
  /** id of the sticker */
  id: z.string(),
  /** for standard stickers, id of the pack the sticker is from */
  packId: z.string().optional(),
  /** name of the sticker */
  name: z.string(),
  /** description of the sticker */
  description: z.string().optional(),
  /** autocomplete/suggestion tags for the sticker (max 200 characters) */
  tags: z.string(),
  /** @deprecated previously the sticker asset hash, now an empty string */
  asset: z.string(),
  /** type of sticker */
  type: stickerType,
  /** type of sticker format */
  formatType: stickerFormatType,
  /** whether this guild sticker can be used, may be false due to loss of Server Boosts */
  available: z.boolean().optional(),
  /** id of the guild that owns this sticker */
  guildId: z.string().optional(),
  /** the user that uploaded the guild sticker */
  user: user.optional(),
  /** the standard sticker's sort order within its pack */
  sortValue: z.number().optional()
});

export type Sticker = z.infer<typeof sticker>;
