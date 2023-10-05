import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { stickerFormatTypeSchema } from "./StickerFormatType.js";
import { stickerTypeSchema } from "./StickerType.js";

export const stickerSchema = z.object({
  /** id of the sticker */
  id: snowflake,
  /** for standard stickers, id of the pack the sticker is from */
  packId: snowflake.nullish(),
  /** name of the sticker */
  name: z.string(),
  /** description of the sticker */
  description: z.string().optional(),
  /** autocomplete/suggestion tags for the sticker (max 200 characters) */
  tags: z.string().max(200),
  /** @deprecated previously the sticker asset hash, now an empty string */
  asset: z.string().nullish(),
  /** type of sticker */
  type: stickerTypeSchema,
  /** type of sticker format */
  formatType: stickerFormatTypeSchema,
  /** whether this guild sticker can be used, may be false due to loss of Server Boosts */
  available: z.boolean().nullish(),
  /** id of the guild that owns this sticker */
  guildId: snowflake.nullish(),
  /** the user that uploaded the guild sticker */
  user: userSchema.nullish(),
  /** the standard sticker's sort order within its pack */
  sortValue: z.number().int().nullish()
});

export type Sticker = z.infer<typeof stickerSchema>;
