import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { emojiSchema } from "../../emoji/types/Emoji.js";
import { stickerSchema } from "../../sticker/types/Sticker.js";
import { guildFeaturesSchema } from "./GuildFeatures.js";

export const guildPreviewSchema = v.object({
  /** guild id */
  id: snowflake as v.GenericSchema<string>,
  /** guild name (2-100 characters) */
  name: v.string(),
  /** icon hash */
  icon: v.exactOptional<v.GenericSchema<string>>(v.string()),
  /** splash hash */
  splash: v.exactOptional<v.GenericSchema<string>>(v.string()),
  /** discovery splash hash */
  discoverySplash: v.exactOptional<v.GenericSchema<string>>(v.string()),
  /** custom guild emojis */
  emojis: v.array(emojiSchema),
  /** enabled guild features */
  features: v.array(guildFeaturesSchema),
  /** approximate number of members in this guild */
  approximateMemberCount: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(0)
  ) as v.GenericSchema<number>,
  /** approximate number of online members in this guild */
  approximatePresenceCount: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(0)
  ) as v.GenericSchema<number>,
  /** the description for the guild */
  description: v.exactOptional(v.string()),
  /** custom guild stickers */
  stickers: v.array(stickerSchema)
});

export interface GuildPreview
  extends v.InferOutput<typeof guildPreviewSchema> {}
