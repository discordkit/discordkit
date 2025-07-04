import * as v from "valibot";
import { snowflake, boundedInteger } from "@discordkit/core";
import { emojiSchema } from "../../emoji/types/Emoji.js";
import { stickerSchema } from "../../sticker/types/Sticker.js";
import { guildFeaturesSchema } from "./GuildFeatures.js";

export const guildPreviewSchema = v.object({
  /** guild id */
  id: snowflake,
  /** guild name (2-100 characters) */
  name: v.string(),
  /** icon hash */
  icon: v.exactOptional(v.string()),
  /** splash hash */
  splash: v.exactOptional(v.string()),
  /** discovery splash hash */
  discoverySplash: v.exactOptional(v.string()),
  /** custom guild emojis */
  emojis: v.array(emojiSchema),
  /** enabled guild features */
  features: v.array(guildFeaturesSchema),
  /** approximate number of members in this guild */
  approximateMemberCount: boundedInteger(),
  /** approximate number of online members in this guild */
  approximatePresenceCount: boundedInteger(),
  /** the description for the guild */
  description: v.exactOptional(v.string()),
  /** custom guild stickers */
  stickers: v.array(stickerSchema)
});

export interface GuildPreview
  extends v.InferOutput<typeof guildPreviewSchema> {}
