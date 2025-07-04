import * as v from "valibot";
import {
  snowflake,
  asDigits,
  asInteger,
  boundedInteger,
  boundedString
} from "@discordkit/core";
import { emojiSchema } from "../../emoji/types/Emoji.js";
import { stickerSchema } from "../../sticker/types/Sticker.js";
import { localesSchema } from "../../application/types/Locales.js";
import { roleSchema } from "../../permissions/Role.js";
import { welcomeScreenSchema } from "./WelcomeScreen.js";
import { premiumTierSchema } from "./PremiumTier.js";
import { guildNSFWLevelSchema } from "./GuildNSFWLevel.js";
import { verificationLevelSchema } from "./VerificationLevel.js";
import { mfaLevelSchema } from "./MFALevel.js";
import { explicitContentFilterLevelSchema } from "./ExplicitContentFilterLevel.js";
import { defaultMessageNotificationLevelSchema } from "./DefaultMessageNotificationLevel.js";
import { guildFeaturesSchema } from "./GuildFeatures.js";
import { systemChannelFlag } from "./SystemChannelFlags.js";
import { permissionFlag } from "../../permissions/Permissions.js";
import { incidentsDataSchema } from "./IncidentsData.js";

export const guildSchema = v.object({
  /** guild id */
  id: snowflake,
  /** guild name (2-100 characters, excluding trailing and leading whitespace) */
  name: boundedString({ max: 100 }),
  /** icon hash */
  icon: v.nullable(boundedString()),
  /** icon hash, returned when in the template object */
  iconHash: v.nullish(boundedString()),
  /** splash hash */
  splash: v.nullable(boundedString()),
  /** discovery splash hash; only present for guilds with the "DISCOVERABLE" feature */
  discoverySplash: v.nullable(boundedString()),
  /** true if the user is the owner of the guild */
  owner: v.exactOptional(v.boolean()),
  /** id of owner */
  ownerId: snowflake,
  /** total permissions for the user in the guild (excludes overwrites) */
  permissions: v.exactOptional(asDigits(permissionFlag)),
  /** @deprecated voice region id for the guild */
  region: v.nullish(boundedString()),
  /** id of afk channel */
  afkChannelId: v.nullable(snowflake),
  /** afk timeout in seconds */
  afkTimeout: boundedInteger(),
  /** true if the server widget is enabled */
  widgetEnabled: v.exactOptional(v.boolean()),
  /** the channel id that the widget will generate an invite to, or null if set to no invite */
  widgetChannelId: v.nullish(snowflake),
  /** verification level required for the guild */
  verificationLevel: verificationLevelSchema,
  /** default message notifications level */
  defaultMessageNotifications: defaultMessageNotificationLevelSchema,
  /** explicit content filter level */
  explicitContentFilter: explicitContentFilterLevelSchema,
  /** roles in the guild */
  roles: v.array(roleSchema),
  /** custom guild emojis */
  emojis: v.array(emojiSchema),
  /** enabled guild features */
  features: v.array(guildFeaturesSchema),
  /** required MFA level for the guild */
  mfaLevel: mfaLevelSchema,
  /** application id of the guild creator if it is bot-created */
  applicationId: v.nullable(snowflake),
  /** the id of the channel where guild notices such as welcome messages and boost events are posted */
  systemChannelId: v.nullable(snowflake),
  /** system channel flags */
  systemChannelFlags: asInteger(systemChannelFlag),
  /** the id of the channel where Community guilds can display rules and/or guidelines */
  rulesChannelId: v.nullable(snowflake),
  /** the maximum number of presences for the guild (null is always returned, apart from the largest of guilds) */
  maxPresences: v.nullish(boundedInteger()),
  /** the maximum number of members for the guild */
  maxMembers: v.exactOptional(boundedInteger()),
  /** the vanity url code for the guild */
  vanityUrlCode: v.nullable(boundedString()),
  /** the description of a Community guild */
  description: v.nullable(v.string()),
  /** banner hash */
  banner: v.nullable(boundedString()),
  /** premium tier (Server Boost level) */
  premiumTier: premiumTierSchema,
  /** the number of boosts this guild currently has */
  premiumSubscriptionCount: v.exactOptional(boundedInteger()),
  /** the preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions; defaults to "en-US" */
  preferredLocale: localesSchema,
  /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
  publicUpdatesChannelId: v.nullable(snowflake),
  /** the maximum amount of users in a video channel */
  maxVideoChannelUsers: v.exactOptional(boundedInteger()),
  /** the maximum amount of users in a stage video channel */
  maxStageVideoChannelUsers: v.exactOptional(boundedInteger()),
  /** approximate number of members in this guild, returned from the **GET** `/guilds/:guild` endpoint when `withCounts` is `true` */
  approximateMemberCount: v.exactOptional(boundedInteger()),
  /** approximate number of non-offline members in this guild, returned from the **GET** `/guilds/:guild` endpoint when `withCounts` is `true` */ approximatePresenceCount:
    v.exactOptional(boundedInteger()),
  /** the welcome screen of a Community guild, shown to new members, returned in an Invite's guild object */
  welcomeScreen: v.exactOptional(welcomeScreenSchema),
  /** guild NSFW level */
  nsfwLevel: guildNSFWLevelSchema,
  /** custom guild stickers */
  stickers: v.exactOptional(v.array(stickerSchema)),
  /** whether the guild has the boost progress bar enabled */
  premiumProgressBarEnabled: v.boolean(),
  /** the id of the channel where admins and moderators of Community guilds receive safety alerts from Discord */
  safetyAlertsChannelId: v.nullable(snowflake),
  /** the incidents data for this guild */
  incidentsData: v.exactOptional(incidentsDataSchema)
});

export interface Guild extends v.InferOutput<typeof guildSchema> {}
