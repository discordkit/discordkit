import {
  object,
  string,
  minLength,
  maxLength,
  nullish,
  boolean,
  array,
  integer,
  minValue,
  number,
  type InferOutput,
  pipe,
  nonEmpty,
  nullable,
  exactOptional,
  type GenericSchema
} from "valibot";
import { snowflake, asDigits, asInteger } from "@discordkit/core";
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

export const guildSchema = object({
  /** guild id */
  id: snowflake as GenericSchema<string>,
  /** guild name (2-100 characters, excluding trailing and leading whitespace) */
  name: pipe(string(), minLength(2), maxLength(100)) as GenericSchema<string>,
  /** icon hash */
  icon: nullable<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** icon hash, returned when in the template object */
  iconHash: nullish<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** splash hash */
  splash: nullable<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** discovery splash hash; only present for guilds with the "DISCOVERABLE" feature */
  discoverySplash: nullable<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** true if the user is the owner of the guild */
  owner: exactOptional(boolean()),
  /** id of owner */
  ownerId: snowflake as GenericSchema<string>,
  /** total permissions for the user in the guild (excludes overwrites) */
  permissions: exactOptional(asDigits(permissionFlag) as GenericSchema<string>),
  /** @deprecated voice region id for the guild */
  region: nullish<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** id of afk channel */
  afkChannelId: nullable<GenericSchema<string>>(snowflake),
  /** afk timeout in seconds */
  afkTimeout: pipe(number(), integer(), minValue(0)) as GenericSchema<number>,
  /** true if the server widget is enabled */
  widgetEnabled: exactOptional(boolean()),
  /** the channel id that the widget will generate an invite to, or null if set to no invite */
  widgetChannelId: nullish<GenericSchema<string>>(snowflake),
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
  applicationId: nullable<GenericSchema<string>>(snowflake),
  /** the id of the channel where guild notices such as welcome messages and boost events are posted */
  systemChannelId: nullable<GenericSchema<string>>(snowflake),
  /** system channel flags */
  systemChannelFlags: asInteger(systemChannelFlag) as GenericSchema<number>,
  /** the id of the channel where Community guilds can display rules and/or guidelines */
  rulesChannelId: nullable<GenericSchema<string>>(snowflake),
  /** the maximum number of presences for the guild (null is always returned, apart from the largest of guilds) */
  maxPresences: nullish<GenericSchema<number>>(
    pipe(number(), integer(), minValue(0))
  ),
  /** the maximum number of members for the guild */
  maxMembers: exactOptional<GenericSchema<number>>(
    pipe(number(), integer(), minValue(0))
  ),
  /** the vanity url code for the guild */
  vanityUrlCode: nullable<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** the description of a Community guild */
  description: nullable(string()),
  /** banner hash */
  banner: nullable<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** premium tier (Server Boost level) */
  premiumTier: premiumTierSchema,
  /** the number of boosts this guild currently has */
  premiumSubscriptionCount: exactOptional<GenericSchema<number>>(
    pipe(number(), integer(), minValue(0))
  ),
  /** the preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions; defaults to "en-US" */
  preferredLocale: localesSchema,
  /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
  publicUpdatesChannelId: nullable<GenericSchema<string>>(snowflake),
  /** the maximum amount of users in a video channel */
  maxVideoChannelUsers: exactOptional<GenericSchema<number>>(
    pipe(number(), integer(), minValue(0))
  ),
  /** the maximum amount of users in a stage video channel */
  maxStageVideoChannelUsers: exactOptional<GenericSchema<number>>(
    pipe(number(), integer(), minValue(0))
  ),
  /** approximate number of members in this guild, returned from the **GET** `/guilds/:guild` endpoint when `withCounts` is `true` */
  approximateMemberCount: exactOptional<GenericSchema<number>>(
    pipe(number(), integer(), minValue(0))
  ),
  /** approximate number of non-offline members in this guild, returned from the **GET** `/guilds/:guild` endpoint when `withCounts` is `true` */ approximatePresenceCount:
    exactOptional<GenericSchema<number>>(
      pipe(number(), integer(), minValue(0))
    ),
  /** the welcome screen of a Community guild, shown to new members, returned in an Invite's guild object */
  welcomeScreen: exactOptional(welcomeScreenSchema),
  /** guild NSFW level */
  nsfwLevel: guildNSFWLevelSchema,
  /** custom guild stickers */
  stickers: exactOptional(array(stickerSchema)),
  /** whether the guild has the boost progress bar enabled */
  premiumProgressBarEnabled: boolean(),
  /** the id of the channel where admins and moderators of Community guilds receive safety alerts from Discord */
  safetyAlertsChannelId: nullable<GenericSchema<string>>(snowflake),
  /** the incidents data for this guild */
  incidentsData: exactOptional(incidentsDataSchema)
});

export interface Guild extends InferOutput<typeof guildSchema> {}
