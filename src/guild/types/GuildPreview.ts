import { z } from "zod";
import { emojiSchema } from "../../emoji/types/Emoji";
import { stickerSchema } from "../../sticker/types/Sticker";
import { guildFeaturesSchema } from "./GuildFeatures";

export const guildPreviewSchema = z.object({
  /** guild id */
  id: z.string(),
  /** guild name (2-100 characters) */
  name: z.string(),
  /** icon hash */
  icon: z.string().optional(),
  /** splash hash */
  splash: z.string().optional(),
  /** discovery splash hash */
  discoverySplash: z.string().optional(),
  /** custom guild emojis */
  emojis: emojiSchema.array(),
  /** enabled guild features */
  features: guildFeaturesSchema.array(),
  /** approximate number of members in this guild */
  approximateMemberCount: z.number().int().positive(),
  /** approximate number of online members in this guild */
  approximatePresenceCount: z.number().int().positive(),
  /** the description for the guild */
  description: z.string().optional(),
  /** custom guild stickers */
  stickers: stickerSchema.array()
});

export type GuildPreview = z.infer<typeof guildPreviewSchema>;
