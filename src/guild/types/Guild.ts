import { z } from "zod";
import { emojiSchema } from "../../emoji/types/Emoji";
import { stickerSchema } from "../../sticker/types/Sticker";
import { roleSchema } from "./Role";
import { welcomeScreenSchema } from "./WelcomeScreen";
import { premiumTierSchema } from "./PremiumTier";
import { guildNSFWLevelSchema } from "./GuildNSFWLevel";
import { verificationLevelSchema } from "./VerificationLevel";
import { mfaLevelSchema } from "./MFALevel";
import { explicitContentFilterLevelSchema } from "./ExplicitContentFilterLevel";
import { defaultMessageNotificationLevelSchema } from "./DefaultMessageNotificationLevel";
import { guildFeaturesSchema } from "./GuildFeatures";
import { localesSchema } from "../../application";

export const guildSchema = z.object({
  /** guild id */
  id: z.string().min(1),
  /** guild name (2-100 characters, excluding trailing and leading whitespace) */
  name: z.string().min(2).max(100),
  /** icon hash */
  icon: z.string().min(1).optional(),
  /** icon hash, returned when in the template object */
  iconHash: z.string().min(1).nullable().optional(),
  /** splash hash */
  splash: z.string().min(1).optional(),
  /** discovery splash hash; only present for guilds with the "DISCOVERABLE" feature */
  discoverySplash: z.string().min(1).optional(),
  /** true if the user is the owner of the guild */
  owner: z.boolean().nullable().optional(),
  /** id of owner */
  ownerId: z.string().min(1),
  /** total permissions for the user in the guild (excludes overwrites) */
  permissions: z.string().nullable(),
  /** @deprecated voice region id for the guild */
  region: z.string().min(1).nullable().optional(),
  /** id of afk channel */
  afkChannelId: z.string().min(1).optional(),
  /** afk timeout in seconds */
  afkTimeout: z.number().int().positive(),
  /** true if the server widget is enabled */
  widgetEnabled: z.boolean().nullable(),
  /** the channel id that the widget will generate an invite to, or null if set to no invite */
  widgetChannelId: z.string().min(1).nullable().optional(),
  /** verification level required for the guild */
  verificationLevel: verificationLevelSchema,
  /** default message notifications level */
  defaultMessageNotifications: defaultMessageNotificationLevelSchema,
  /** explicit content filter level */
  explicitContentFilter: explicitContentFilterLevelSchema,
  /** roles in the guild */
  roles: roleSchema.array(),
  /** custom guild emojis */
  emojis: emojiSchema.array(),
  /** enabled guild features */
  features: guildFeaturesSchema.array(),
  /** required MFA level for the guild */
  mfaLevel: mfaLevelSchema,
  /** application id of the guild creator if it is bot-created */
  applicationId: z.string().min(1).optional(),
  /** the id of the channel where guild notices such as welcome messages and boost events are posted */
  systemChannelId: z.string().min(1).optional(),
  /** system channel flags */
  systemChannelFlags: z.number().int(),
  /** the id of the channel where Community guilds can display rules and/or guidelines */
  rulesChannelId: z.string().min(1).optional(),
  /** the maximum number of presences for the guild (null is always returned, apart from the largest of guilds) */
  maxPresences: z.number().int().positive().nullable().optional(),
  /** the maximum number of members for the guild */
  maxMembers: z.number().int().positive().nullable(),
  /** the vanity url code for the guild */
  vanityUrlCode: z.string().min(1).optional(),
  /** the description of a Community guild */
  description: z.string().optional(),
  /** banner hash */
  banner: z.string().min(1).optional(),
  /** premium tier (Server Boost level) */
  premiumTier: premiumTierSchema,
  /** the number of boosts this guild currently has */
  premiumSubscriptionCount: z.number().int().positive().nullable(),
  /** the preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions; defaults to "en-US" */
  preferredLocale: localesSchema,
  /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
  publicUpdatesChannelId: z.string().min(1).optional(),
  /** the maximum amount of users in a video channel */
  maxVideoChannelUsers: z.number().int().positive().nullable(),
  /** the maximum amount of users in a stage video channel */
  maxStageVideoChannelUsers: z.number().int().positive().nullable(),
  /** approximate number of members in this guild, returned from the **GET** `/guilds/:guild` endpoint when `withCounts` is `true` */
  approximateMemberCount: z.number().int().positive().nullable(),
  /** approximate number of non-offline members in this guild, returned from the **GET** `/guilds/:guild` endpoint when `withCounts` is `true` */ approximatePresenceCount:
    z.number().int().positive().nullable(),
  /** the welcome screen of a Community guild, shown to new members, returned in an Invite's guild object */
  welcomeScreen: welcomeScreenSchema.nullable(),
  /** guild NSFW level */
  nsfwLevel: guildNSFWLevelSchema,
  /** custom guild stickers */
  stickers: stickerSchema.array().nullable(),
  /** whether the guild has the boost progress bar enabled */
  premiumProgressBarEnabled: z.boolean(),
  /** the id of the channel where admins and moderators of Community guilds receive safety alerts from Discord */
  safetyAlertsChannelId: z.string().min(1).optional()
});

export type Guild = z.infer<typeof guildSchema>;
