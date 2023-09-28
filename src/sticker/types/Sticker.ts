import { z } from "zod";
import { userSchema } from "#/user/types/User.ts";
import { stickerFormatTypeSchema } from "./StickerFormatType.ts";
import { stickerTypeSchema } from "./StickerType.ts";

export const stickerSchema = z.object({
  /** id of the sticker */
  id: z.string(),
  /** for standard stickers, id of the pack the sticker is from */
  packId: z.string().nullable(),
  /** name of the sticker */
  name: z.string(),
  /** description of the sticker */
  description: z.string().optional(),
  /** autocomplete/suggestion tags for the sticker (max 200 characters) */
  tags: z.string().max(200),
  /** @deprecated previously the sticker asset hash, now an empty string */
  asset: z.string().nullable(),
  /** type of sticker */
  type: stickerTypeSchema,
  /** type of sticker format */
  formatType: stickerFormatTypeSchema,
  /** whether this guild sticker can be used, may be false due to loss of Server Boosts */
  available: z.boolean().nullable(),
  /** id of the guild that owns this sticker */
  guildId: z.string().nullable(),
  /** the user that uploaded the guild sticker */
  user: userSchema.nullable(),
  /** the standard sticker's sort order within its pack */
  sortValue: z.number().int().nullable()
});

export type Sticker = z.infer<typeof stickerSchema>;
