import {
  object,
  string,
  optional,
  array,
  number,
  integer,
  minValue,
  type InferOutput,
  pipe
} from "valibot";
import { snowflake } from "@discordkit/core";
import { emojiSchema } from "../../emoji/types/Emoji.js";
import { stickerSchema } from "../../sticker/types/Sticker.js";
import { guildFeaturesSchema } from "./GuildFeatures.js";

export const guildPreviewSchema = object({
  /** guild id */
  id: snowflake,
  /** guild name (2-100 characters) */
  name: string(),
  /** icon hash */
  icon: optional(string()),
  /** splash hash */
  splash: optional(string()),
  /** discovery splash hash */
  discoverySplash: optional(string()),
  /** custom guild emojis */
  emojis: array(emojiSchema),
  /** enabled guild features */
  features: array(guildFeaturesSchema),
  /** approximate number of members in this guild */
  approximateMemberCount: pipe(number(), integer(), minValue(0)),
  /** approximate number of online members in this guild */
  approximatePresenceCount: pipe(number(), integer(), minValue(0)),
  /** the description for the guild */
  description: optional(string()),
  /** custom guild stickers */
  stickers: array(stickerSchema)
});

export type GuildPreview = InferOutput<typeof guildPreviewSchema>;
