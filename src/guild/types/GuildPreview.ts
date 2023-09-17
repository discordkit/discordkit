import { z } from "zod";
import { emoji } from "../../emoji";
import { sticker } from "../../sticker";
import { guildFeatures } from "./GuildFeatures";

export const guildPreview = z.object({
  /** guild id */
  id: z.string(),
  /** guild name (2-100 characters) */
  name: z.string(),
  /** icon hash */
  icon: z.union([z.string(), z.null()]),
  /** splash hash */
  splash: z.union([z.string(), z.null()]),
  /** discovery splash hash */
  discoverySplash: z.union([z.string(), z.null()]),
  /** custom guild emojis */
  emojis: emoji.array(),
  /** enabled guild features */
  features: guildFeatures.array(),
  /** approximate number of members in this guild */
  approximateMemberCount: z.number(),
  /** approximate number of online members in this guild */
  approximatePresenceCount: z.number(),
  /** the description for the guild */
  description: z.union([z.string(), z.null()]),
  /** custom guild stickers */
  stickers: sticker.array()
});

export type GuildPreview = z.infer<typeof guildPreview>;
