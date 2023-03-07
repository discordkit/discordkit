import type { Emoji } from "../../emoji";
import type { Sticker } from "../../sticker";
import type { GuildFeatures } from "./GuildFeatures";

export interface GuildPreview {
  /** guild id */
  id: string;
  /** guild name (2-100 characters) */
  name: string;
  /** icon hash */
  icon: string | null;
  /** splash hash */
  splash: string | null;
  /** discovery splash hash */
  discoverySplash: string | null;
  /** custom guild emojis */
  emojis: Emoji[];
  /** enabled guild features */
  features: GuildFeatures[];
  /** approximate number of members in this guild */
  approximateMemberCount: number;
  /** approximate number of online members in this guild */
  approximatePresenceCount: number;
  /** the description for the guild */
  description: string | null;
  /** custom guild stickers */
  stickers: Sticker[];
}
