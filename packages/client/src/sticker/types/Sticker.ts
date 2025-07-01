import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { stickerFormatTypeSchema } from "./StickerFormatType.js";
import { stickerTypeSchema } from "./StickerType.js";

export const stickerSchema = v.object({
  /** id of the sticker */
  id: snowflake,
  /** for standard stickers, id of the pack the sticker is from */
  packId: v.exactOptional(snowflake),
  /** name of the sticker */
  name: v.string(),
  /** description of the sticker */
  description: v.nullable(v.pipe(v.string(), v.nonEmpty())),
  /** autocomplete/suggestion tags for the sticker (max 200 characters) */
  tags: v.pipe(v.string(), v.maxLength(200)),
  /** type of sticker */
  type: stickerTypeSchema,
  /** type of sticker format */
  formatType: stickerFormatTypeSchema,
  /** whether this guild sticker can be used, may be false due to loss of Server Boosts */
  available: v.exactOptional(v.boolean()),
  /** id of the guild that owns this sticker */
  guildId: v.exactOptional(snowflake),
  /** the user that uploaded the guild sticker */
  user: v.exactOptional(userSchema),
  /** the standard sticker's sort order within its pack */
  sortValue: v.exactOptional(v.pipe(v.number(), v.integer()))
});

export interface Sticker extends v.InferOutput<typeof stickerSchema> {}
