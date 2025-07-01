import * as v from "valibot";
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

export const guildSchema = v.object({
  /** guild id */
  id: snowflake as v.GenericSchema<string>,
  /** guild name (2-100 characters, excluding trailing and leading whitespace) */
  name: v.pipe(
    v.string(),
    v.minLength(2),
    v.maxLength(100)
  ) as v.GenericSchema<string>,
  /** icon hash */
  icon: v.nullable<v.GenericSchema<string>>(v.pipe(v.string(), v.nonEmpty())),
  /** icon hash, returned when in the template object */
  iconHash: v.nullish<v.GenericSchema<string>>(
    v.pipe(v.string(), v.nonEmpty())
  ),
  /** splash hash */
  splash: v.nullable<v.GenericSchema<string>>(v.pipe(v.string(), v.nonEmpty())),
  /** discovery splash hash; only present for guilds with the "DISCOVERABLE" feature */
  discoverySplash: v.nullable<v.GenericSchema<string>>(
    v.pipe(v.string(), v.nonEmpty())
  ),
  /** true if the user is the owner of the guild */
  owner: v.exactOptional(v.boolean()),
  /** id of owner */
  ownerId: snowflake as v.GenericSchema<string>,
  /** total permissions for the user in the guild (excludes overwrites) */
  permissions: v.exactOptional(
    asDigits(permissionFlag) as v.GenericSchema<string>
  ),
  /** @deprecated voice region id for the guild */
  region: v.nullish<v.GenericSchema<string>>(v.pipe(v.string(), v.nonEmpty())),
  /** id of afk channel */
  afkChannelId: v.nullable<v.GenericSchema<string>>(snowflake),
  /** afk timeout in seconds */
  afkTimeout: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(0)
  ) as v.GenericSchema<number>,
  /** true if the server widget is enabled */
  widgetEnabled: v.exactOptional(v.boolean()),
  /** the channel id that the widget will generate an invite to, or null if set to no invite */
  widgetChannelId: v.nullish<v.GenericSchema<string>>(snowflake),
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
  applicationId: v.nullable<v.GenericSchema<string>>(snowflake),
  /** the id of the channel where guild notices such as welcome messages and boost events are posted */
  systemChannelId: v.nullable<v.GenericSchema<string>>(snowflake),
  /** system channel flags */
  systemChannelFlags: asInteger(systemChannelFlag) as v.GenericSchema<number>,
  /** the id of the channel where Community guilds can display rules and/or guidelines */
  rulesChannelId: v.nullable<v.GenericSchema<string>>(snowflake),
  /** the maximum number of presences for the guild (null is always returned, apart from the largest of guilds) */
  maxPresences: v.nullish<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** the maximum number of members for the guild */
  maxMembers: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** the vanity url code for the guild */
  vanityUrlCode: v.nullable<v.GenericSchema<string>>(
    v.pipe(v.string(), v.nonEmpty())
  ),
  /** the description of a Community guild */
  description: v.nullable(v.string()),
  /** banner hash */
  banner: v.nullable<v.GenericSchema<string>>(v.pipe(v.string(), v.nonEmpty())),
  /** premium tier (Server Boost level) */
  premiumTier: premiumTierSchema,
  /** the number of boosts this guild currently has */
  premiumSubscriptionCount: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** the preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions; defaults to "en-US" */
  preferredLocale: localesSchema,
  /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
  publicUpdatesChannelId: v.nullable<v.GenericSchema<string>>(snowflake),
  /** the maximum amount of users in a video channel */
  maxVideoChannelUsers: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** the maximum amount of users in a stage video channel */
  maxStageVideoChannelUsers: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** approximate number of members in this guild, returned from the **GET** `/guilds/:guild` endpoint when `withCounts` is `true` */
  approximateMemberCount: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** approximate number of non-offline members in this guild, returned from the **GET** `/guilds/:guild` endpoint when `withCounts` is `true` */ approximatePresenceCount:
    v.exactOptional<v.GenericSchema<number>>(
      v.pipe(v.number(), v.integer(), v.minValue(0))
    ),
  /** the welcome screen of a Community guild, shown to new members, returned in an Invite's guild object */
  welcomeScreen: v.exactOptional(welcomeScreenSchema),
  /** guild NSFW level */
  nsfwLevel: guildNSFWLevelSchema,
  /** custom guild stickers */
  stickers: v.exactOptional(v.array(stickerSchema)),
  /** whether the guild has the boost progress bar enabled */
  premiumProgressBarEnabled: v.boolean(),
  /** the id of the channel where admins and moderators of Community guilds receive safety alerts from Discord */
  safetyAlertsChannelId: v.nullable<v.GenericSchema<string>>(snowflake),
  /** the incidents data for this guild */
  incidentsData: v.exactOptional(incidentsDataSchema)
});

export interface Guild extends v.InferOutput<typeof guildSchema> {}
