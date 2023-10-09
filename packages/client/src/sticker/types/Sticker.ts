import {
  object,
  nullish,
  string,
  optional,
  maxLength,
  boolean,
  number,
  integer,
  type Output
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { stickerFormatTypeSchema } from "./StickerFormatType.js";
import { stickerTypeSchema } from "./StickerType.js";

export const stickerSchema = object({
  /** id of the sticker */
  id: snowflake,
  /** for standard stickers, id of the pack the sticker is from */
  packId: nullish(snowflake),
  /** name of the sticker */
  name: string(),
  /** description of the sticker */
  description: optional(string()),
  /** autocomplete/suggestion tags for the sticker (max 200 characters) */
  tags: string([maxLength(200)]),
  /** @deprecated previously the sticker asset hash, now an empty string */
  asset: nullish(string()),
  /** type of sticker */
  type: stickerTypeSchema,
  /** type of sticker format */
  formatType: stickerFormatTypeSchema,
  /** whether this guild sticker can be used, may be false due to loss of Server Boosts */
  available: nullish(boolean()),
  /** id of the guild that owns this sticker */
  guildId: nullish(snowflake),
  /** the user that uploaded the guild sticker */
  user: nullish(userSchema),
  /** the standard sticker's sort order within its pack */
  sortValue: nullish(number([integer()]))
});

export type Sticker = Output<typeof stickerSchema>;
