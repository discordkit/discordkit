import { z } from "zod";
import { userSchema } from "../../user/types/User";
import { stickerFormatTypeSchema } from "./StickerFormatType";
import { stickerTypeSchema } from "./StickerType";

export const stickerSchema = z.object({
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
  type: stickerTypeSchema,
  /** type of sticker format */
  formatType: stickerFormatTypeSchema,
  /** whether this guild sticker can be used, may be false due to loss of Server Boosts */
  available: z.boolean().optional(),
  /** id of the guild that owns this sticker */
  guildId: z.string().optional(),
  /** the user that uploaded the guild sticker */
  user: userSchema.optional(),
  /** the standard sticker's sort order within its pack */
  sortValue: z.number().optional()
});

export type Sticker = z.infer<typeof stickerSchema>;
