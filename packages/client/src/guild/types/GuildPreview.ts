import {
  object,
  string,
  exactOptional,
  array,
  number,
  integer,
  minValue,
  type InferOutput,
  pipe,
  type GenericSchema
} from "valibot";
import { snowflake } from "@discordkit/core";
import { emojiSchema } from "../../emoji/types/Emoji.js";
import { stickerSchema } from "../../sticker/types/Sticker.js";
import { guildFeaturesSchema } from "./GuildFeatures.js";

export const guildPreviewSchema = object({
  /** guild id */
  id: snowflake as GenericSchema<string>,
  /** guild name (2-100 characters) */
  name: string(),
  /** icon hash */
  icon: exactOptional<GenericSchema<string>>(string()),
  /** splash hash */
  splash: exactOptional<GenericSchema<string>>(string()),
  /** discovery splash hash */
  discoverySplash: exactOptional<GenericSchema<string>>(string()),
  /** custom guild emojis */
  emojis: array(emojiSchema),
  /** enabled guild features */
  features: array(guildFeaturesSchema),
  /** approximate number of members in this guild */
  approximateMemberCount: pipe(
    number(),
    integer(),
    minValue(0)
  ) as GenericSchema<number>,
  /** approximate number of online members in this guild */
  approximatePresenceCount: pipe(
    number(),
    integer(),
    minValue(0)
  ) as GenericSchema<number>,
  /** the description for the guild */
  description: exactOptional(string()),
  /** custom guild stickers */
  stickers: array(stickerSchema)
});

export interface GuildPreview extends InferOutput<typeof guildPreviewSchema> {}
