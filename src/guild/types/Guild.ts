import { z } from "zod";
import { channelSchema } from "../../channel/types/Channel";
import { emojiSchema } from "../../emoji/types/Emoji";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent";
import { stageSchema } from "../../stage/types/Stage";
import { stickerSchema } from "../../sticker/types/Sticker";
import { voiceStateSchema } from "../../voice/types/VoiceState";
import { roleSchema } from "./Role";
import { presenceSchema } from "./Presence";
import { welcomeScreenSchema } from "./WelcomeScreen";
import { systemChannelFlagsSchema } from "./SystemChannelFlags";
import { premiumTierSchema } from "./PremiumTier";
import { guildNSFWLevelSchema } from "./GuildNSFWLevel";
import { verificationLevelSchema } from "./VerificationLevel";
import { mfaLevelSchema } from "./MFALevel";
import { explicitContentFilterLevelSchema } from "./ExplicitContentFilterLevel";
import { defaultMessageNotificationLevelSchema } from "./DefaultMessageNotificationLevel";
import { guildFeaturesSchema } from "./GuildFeatures";
import { memberSchema } from "./Member";

export const guildSchema = z.object({
  /** guild id */
  id: z.string(),
  /** guild name (2-100 characters, excluding trailing and leading whitespace) */
  name: z.string(),
  /** icon hash */
  icon: z.string().optional(),
  /** icon hash, returned when in the template object */
  iconHash: z.string().optional(),
  /** splash hash */
  splash: z.string().optional(),
  /** discovery splash hash; only present for guilds with the "DISCOVERABLE" feature */
  discoverySplash: z.string().optional(),
  /** true if the user is the owner of the guild */
  owner: z.boolean().optional(),
  /** id of owner */
  ownerId: z.string(),
  /** total permissions for the user in the guild (excludes overwrites) */
  permissions: z.string().optional(),
  /** @deprecated voice region id for the guild */
  region: z.string().optional(),
  /** id of afk channel */
  afkChannelId: z.string().optional(),
  /** afk timeout in seconds */
  afkTimeout: z.string(),
  /** true if the server widget is enabled */
  widgetEnabled: z.boolean().optional(),
  /** the channel id that the widget will generate an invite to, or null if set to no invite */
  widgetChannelId: z.string().optional(),
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
  applicationId: z.string().optional(),
  /** the id of the channel where guild notices such as welcome messages and boost events are posted */
  systemChannelId: z.string().optional(),
  /** system channel flags */
  systemChannelFlags: systemChannelFlagsSchema,
  /** the id of the channel where Community guilds can display rules and/or guidelines */
  rulesChannelId: z.string().optional(),
  /** when this guild was joined at */
  joinedAt: z.number().optional(),
  /** true if this is considered a large guild */
  large: z.boolean().optional(),
  /** true if this guild is unavailable due to an outage */
  unavailable: z.boolean().optional(),
  /** total number of members in this guild */
  memberCount: z.number().optional(),
  /** states of members currently in voice channels; lacks the guild_id key */
  voiceStates: voiceStateSchema.partial().array().optional(),
  /** users in the guild */
  members: memberSchema.array().optional(),
  /** channels in the guild */
  channels: channelSchema.array().optional(),
  /** all active threads in the guild that current user has permission to view */
  threads: channelSchema.array().optional(),
  /** presences of the members in the guild, will only include non-offline members if the size is greater than large threshold */
  presences: presenceSchema.array().optional(),
  /** the maximum number of presences for the guild (null is always returned, apart from the largest of guilds) */
  maxPresences: z.number().optional(),
  /** the maximum number of members for the guild */
  maxMembers: z.number().optional(),
  /** the vanity url code for the guild */
  vanityUrlCode: z.string().optional(),
  /** the description of a Community guild */
  description: z.string().optional(),
  /** banner hash */
  banner: z.string().optional(),
  /** premium tier (Server Boost level) */
  premiumTier: premiumTierSchema,
  /** the number of boosts this guild currently has */
  premiumSubscriptionCount: z.number().optional(),
  /** the preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions; defaults to "en-US" */
  preferredLocale: z.string(),
  /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
  publicUpdatesChannelId: z.string().optional(),
  /** the maximum amount of users in a video channel */
  maxVideoChannelUsers: z.number().optional(),
  /** approximate number of members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true
    approximate_presence_count?	integer	approximate number of non-offline members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true */
  approximateMemberCount: z.number().optional(),
  /** the welcome screen of a Community guild, shown to new members, returned in an Invite's guild object */
  welcomeScreen: welcomeScreenSchema.optional(),
  /** guild NSFW level */
  nsfwLevel: guildNSFWLevelSchema,
  /** Stage instances in the guild */
  stageInstances: stageSchema.array().optional(),
  /** custom guild stickers */
  stickers: stickerSchema.array().optional(),
  /** the scheduled events in the guild */
  guildScheduledEvents: scheduledEventSchema.array().optional(),
  /** whether the guild has the boost progress bar enabled */
  premiumProgressBarEnabled: z.boolean()
});

export type Guild = z.infer<typeof guildSchema>;
