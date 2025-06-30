import {
  object,
  exactOptional,
  string,
  maxLength,
  boolean,
  number,
  integer,
  type InferOutput,
  pipe,
  nullable,
  nonEmpty
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { stickerFormatTypeSchema } from "./StickerFormatType.js";
import { stickerTypeSchema } from "./StickerType.js";

export const stickerSchema = object({
  /** id of the sticker */
  id: snowflake,
  /** for standard stickers, id of the pack the sticker is from */
  packId: exactOptional(snowflake),
  /** name of the sticker */
  name: string(),
  /** description of the sticker */
  description: nullable(pipe(string(), nonEmpty())),
  /** autocomplete/suggestion tags for the sticker (max 200 characters) */
  tags: pipe(string(), maxLength(200)),
  /** type of sticker */
  type: stickerTypeSchema,
  /** type of sticker format */
  formatType: stickerFormatTypeSchema,
  /** whether this guild sticker can be used, may be false due to loss of Server Boosts */
  available: exactOptional(boolean()),
  /** id of the guild that owns this sticker */
  guildId: exactOptional(snowflake),
  /** the user that uploaded the guild sticker */
  user: exactOptional(userSchema),
  /** the standard sticker's sort order within its pack */
  sortValue: exactOptional(pipe(number(), integer()))
});

export type Sticker = InferOutput<typeof stickerSchema>;
