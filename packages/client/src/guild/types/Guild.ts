import {
  object,
  string,
  minLength,
  maxLength,
  optional,
  nullish,
  boolean,
  array,
  integer,
  minValue,
  number,
  type InferOutput,
  pipe,
  nonEmpty,
  nullable
} from "valibot";
import { snowflake } from "@discordkit/core";
import { emojiSchema } from "../../emoji/types/Emoji.js";
import { stickerSchema } from "../../sticker/types/Sticker.js";
import { localesSchema } from "../../application/types/Locales.js";
import { roleSchema } from "./Role.js";
import { welcomeScreenSchema } from "./WelcomeScreen.js";
import { premiumTierSchema } from "./PremiumTier.js";
import { guildNSFWLevelSchema } from "./GuildNSFWLevel.js";
import { verificationLevelSchema } from "./VerificationLevel.js";
import { mfaLevelSchema } from "./MFALevel.js";
import { explicitContentFilterLevelSchema } from "./ExplicitContentFilterLevel.js";
import { defaultMessageNotificationLevelSchema } from "./DefaultMessageNotificationLevel.js";
import { guildFeaturesSchema } from "./GuildFeatures.js";

export const guildSchema = object({
  /** guild id */
  id: snowflake,
  /** guild name (2-100 characters, excluding trailing and leading whitespace) */
  name: pipe(string(), minLength(2), maxLength(100)),
  /** icon hash */
  icon: nullable(pipe(string(), nonEmpty())),
  /** icon hash, returned when in the template object */
  iconHash: nullish(pipe(string(), nonEmpty())),
  /** splash hash */
  splash: nullable(pipe(string(), nonEmpty())),
  /** discovery splash hash; only present for guilds with the "DISCOVERABLE" feature */
  discoverySplash: nullable(pipe(string(), nonEmpty())),
  /** true if the user is the owner of the guild */
  owner: optional(boolean()),
  /** id of owner */
  ownerId: snowflake,
  /** total permissions for the user in the guild (excludes overwrites) */
  permissions: optional(string()),
  /** @deprecated voice region id for the guild */
  region: nullish(pipe(string(), nonEmpty())),
  /** id of afk channel */
  afkChannelId: nullable(snowflake),
  /** afk timeout in seconds */
  afkTimeout: pipe(number(), integer(), minValue(0)),
  /** true if the server widget is enabled */
  widgetEnabled: optional(boolean()),
  /** the channel id that the widget will generate an invite to, or null if set to no invite */
  widgetChannelId: nullish(snowflake),
  /** verification level required for the guild */
  verificationLevel: verificationLevelSchema,
  /** default message notifications level */
  defaultMessageNotifications: defaultMessageNotificationLevelSchema,
  /** explicit content filter level */
  explicitContentFilter: explicitContentFilterLevelSchema,
  /** roles in the guild */
  roles: array(roleSchema),
  /** custom guild emojis */
  emojis: array(emojiSchema),
  /** enabled guild features */
  features: array(guildFeaturesSchema),
  /** required MFA level for the guild */
  mfaLevel: mfaLevelSchema,
  /** application id of the guild creator if it is bot-created */
  applicationId: nullable(snowflake),
  /** the id of the channel where guild notices such as welcome messages and boost events are posted */
  systemChannelId: nullable(snowflake),
  /** system channel flags */
  systemChannelFlags: pipe(number(), integer()),
  /** the id of the channel where Community guilds can display rules and/or guidelines */
  rulesChannelId: nullable(snowflake),
  /** the maximum number of presences for the guild (null is always returned, apart from the largest of guilds) */
  maxPresences: nullish(pipe(number(), integer(), minValue(0))),
  /** the maximum number of members for the guild */
  maxMembers: optional(pipe(number(), integer(), minValue(0))),
  /** the vanity url code for the guild */
  vanityUrlCode: nullable(pipe(string(), nonEmpty())),
  /** the description of a Community guild */
  description: nullable(string()),
  /** banner hash */
  banner: nullable(pipe(string(), nonEmpty())),
  /** premium tier (Server Boost level) */
  premiumTier: premiumTierSchema,
  /** the number of boosts this guild currently has */
  premiumSubscriptionCount: optional(pipe(number(), integer(), minValue(0))),
  /** the preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions; defaults to "en-US" */
  preferredLocale: localesSchema,
  /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
  publicUpdatesChannelId: nullable(snowflake),
  /** the maximum amount of users in a video channel */
  maxVideoChannelUsers: optional(pipe(number(), integer(), minValue(0))),
  /** the maximum amount of users in a stage video channel */
  maxStageVideoChannelUsers: optional(pipe(number(), integer(), minValue(0))),
  /** approximate number of members in this guild, returned from the **GET** `/guilds/:guild` endpoint when `withCounts` is `true` */
  approximateMemberCount: optional(pipe(number(), integer(), minValue(0))),
  /** approximate number of non-offline members in this guild, returned from the **GET** `/guilds/:guild` endpoint when `withCounts` is `true` */ approximatePresenceCount:
    optional(pipe(number(), integer(), minValue(0))),
  /** the welcome screen of a Community guild, shown to new members, returned in an Invite's guild object */
  welcomeScreen: optional(welcomeScreenSchema),
  /** guild NSFW level */
  nsfwLevel: guildNSFWLevelSchema,
  /** custom guild stickers */
  stickers: optional(array(stickerSchema)),
  /** whether the guild has the boost progress bar enabled */
  premiumProgressBarEnabled: boolean(),
  /** the id of the channel where admins and moderators of Community guilds receive safety alerts from Discord */
  safetyAlertsChannelId: nullable(snowflake)
  // TODO: incidentsData
});

export type Guild = InferOutput<typeof guildSchema>;
