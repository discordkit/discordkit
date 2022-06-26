/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
/* eslint-disable no-bitwise */
import { z } from "zod";
import type { Channel } from "../channel/types";
import type { User } from "../user/types";
import type { Emoji } from "../emoji/types";
import type { ScheduledEvent } from "../event/types";
import type { Stage } from "../stage/types";
import type { Sticker } from "../sticker/types";
import type { VoiceState } from "../voice/types";

export interface Guild {
  /** guild id */
  id: string;
  /** guild name (2-100 characters, excluding trailing and leading whitespace) */
  name: string;
  /** icon hash */
  icon?: string;
  /** icon hash, returned when in the template object */
  iconHash?: string;
  /** splash hash */
  splash?: string;
  /** discovery splash hash; only present for guilds with the "DISCOVERABLE" feature */
  discoverySplash?: string;
  /** true if the user is the owner of the guild */
  owner?: boolean;
  /** id of owner */
  ownerId: string;
  /** total permissions for the user in the guild (excludes overwrites) */
  permissions?: string;
  /** @deprecated voice region id for the guild */
  region?: string;
  /** id of afk channel */
  afkChannelId?: string;
  /** afk timeout in seconds */
  afkTimeout: string;
  /** true if the server widget is enabled */
  widgetEnabled?: boolean;
  /** the channel id that the widget will generate an invite to, or null if set to no invite */
  widgetChannelId?: string;
  /** verification level required for the guild */
  verificationLevel: VerificationLevel;
  /** default message notifications level */
  defaultMessageNotifications: DefaultMessageNotificationLevel;
  /** explicit content filter level */
  explicitContentFilter: ExplicitContentFilterLevel;
  /** roles in the guild */
  roles: Role[];
  /** custom guild emojis */
  emojis: Emoji[];
  /** enabled guild features */
  features: GuildFeatures[];
  /** required MFA level for the guild */
  mfaLevel: MFALevel;
  /** application id of the guild creator if it is bot-created */
  applicationId?: string;
  /** the id of the channel where guild notices such as welcome messages and boost events are posted */
  systemChannelId?: string;
  /** system channel flags */
  systemChannelFlags: SystemChannelFlags;
  /** the id of the channel where Community guilds can display rules and/or guidelines */
  rulesChannelId?: string;
  /** when this guild was joined at */
  joinedAt?: number;
  /** true if this is considered a large guild */
  large?: boolean;
  /** true if this guild is unavailable due to an outage */
  unavailable?: boolean;
  /** total number of members in this guild */
  memberCount?: number;
  /** states of members currently in voice channels; lacks the guild_id key */
  voiceStates?: Partial<VoiceState>[];
  /** users in the guild */
  members?: Member[];
  /** channels in the guild */
  channels?: Channel[];
  /** all active threads in the guild that current user has permission to view */
  threads?: Channel[];
  /** presences of the members in the guild, will only include non-offline members if the size is greater than large threshold */
  presences?: Presence[];
  /** the maximum number of presences for the guild (null is always returned, apart from the largest of guilds) */
  maxPresences?: number;
  /** the maximum number of members for the guild */
  maxMembers?: number;
  /** the vanity url code for the guild */
  vanityUrlCode?: string;
  /** the description of a Community guild */
  description?: string;
  /** banner hash */
  banner?: string;
  /** premium tier (Server Boost level) */
  premiumTier: PremiumTier;
  /** the number of boosts this guild currently has */
  premiumSubscriptionCount?: number;
  /** the preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions; defaults to "en-US" */
  preferredLocale: string;
  /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
  publicUpdatesChannelId?: string;
  /** the maximum amount of users in a video channel */
  maxVideoChannelUsers?: number;
  /** approximate number of members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true
    approximate_presence_count?	integer	approximate number of non-offline members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true */
  approximateMemberCount?: number;
  /** the welcome screen of a Community guild, shown to new members, returned in an Invite's guild object */
  welcomeScreen?: WelcomeScreen;
  /** guild NSFW level */
  nsfwLevel: GuildNSFWLevel;
  /** Stage instances in the guild */
  stageInstances?: Stage[];
  /** custom guild stickers */
  stickers?: Sticker[];
  /** the scheduled events in the guild */
  guildScheduledEvents?: ScheduledEvent[];
  /** whether the guild has the boost progress bar enabled */
  premiumProgressBarEnabled: boolean;
}

export interface Member {
  /** the user this guild member represents */
  user?: User;
  /** this user's guild nickname */
  nick?: string;
  /** the member's guild avatar hash */
  avatar?: string;
  /** array of role object ids */
  roles: string[];
  /** when the user joined the guild */
  joinedAt: number;
  /** when the user started boosting the guild */
  premiumSince?: number;
  /** whether the user is deafened in voice channels */
  deaf: boolean;
  /** whether the user is muted in voice channels */
  mute: boolean;
  /** whether the user has not yet passed the guild's Membership Screening requirements */
  pending?: boolean;
  /** total permissions of the member in the channel, including overwrites, returned when in the interaction object */
  permissions?: string;
  /** when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out */
  communicationDisabledUntil?: number;
}

export enum GuildFeatures {
  /** guild has access to set an animated guild icon */
  ANIMATED_ICON = `ANIMATED_ICON`,
  /** guild has access to set a guild banner image */
  BANNER = `BANNER`,
  /** guild has access to use commerce features (i.e. create store channels) */
  COMMERCE = `COMMERCE`,
  /** guild can enable welcome screen, Membership Screening, stage channels and discovery, and receives community updates */
  COMMUNITY = `COMMUNITY`,
  /** guild is able to be discovered in the directory */
  DISCOVERABLE = `DISCOVERABLE`,
  /** guild is able to be featured in the directory */
  FEATURABLE = `FEATURABLE`,
  /** guild has access to set an invite splash background */
  INVITE_SPLAS = `INVITE_SPLASH`,
  /** guild has enabled Membership Screening */
  MEMBER_VERIFICATION_GATE_ENABLED = `MEMBER_VERIFICATION_GATE_ENABLED`,
  /** guild has enabled monetization */
  MONETIZATION_ENABLED = `MONETIZATION_ENABLED`,
  /** guild has increased custom sticker slots */
  MORE_STICKERS = `MORE_STICKERS`,
  /** guild has access to create news channels */
  NEWS = `NEWS`,
  /** guild is partnered */
  PARTNERED = `PARTNERED`,
  /** guild can be previewed before joining via Membership Screening or the directory */
  PREVIEW_ENABLED = `PREVIEW_ENABLED`,
  /** guild has access to create private threads */
  PRIVATE_THREADS = `PRIVATE_THREADS`,
  /** guild is able to set role icons */
  ROLE_ICONS = `ROLE_ICONS`,
  /** guild has access to the seven day archive time for threads */
  SEVEN_DAY_THREAD_ARCHIVE = `SEVEN_DAY_THREAD_ARCHIVE`,
  /** guild has access to the three day archive time for threads */
  THREE_DAY_THREAD_ARCHIVE = `THREE_DAY_THREAD_ARCHIVE`,
  /** guild has enabled ticketed events */
  TICKETED_EVENTS_ENABLED = `TICKETED_EVENTS_ENABLED`,
  /** guild has access to set a vanity URL */
  VANITY_URL = `VANITY_URL`,
  /** guild is verified */
  VERIFIED = `VERIFIED`,
  /** guild has access to set 384kbps bitrate in voice (previously VIP voice servers) */
  VIP_REGIONS = `VIP_REGIONS`,
  /** guild has enabled the welcome screen */
  WELCOME_SCREEN_ENABLED = `WELCOME_SCREEN_ENABLED`
}

export enum DefaultMessageNotificationLevel {
  /** members will receive notifications for all messages by default */
  ALL_MESSAGES = 0,
  /** members will receive notifications only for messages that @mention them by default */
  ONLY_MENTIONS = 1
}

export enum ExplicitContentFilterLevel {
  /** media content will not be scanned */
  DISABLED = 0,
  /** media content sent by members without roles will be scanned */
  MEMBERS_WITHOUT_ROLES = 1,
  /** media content sent by all members will be scanned */
  ALL_MEMBERS = 2
}
export enum MFALevel {
  /** guild has no MFA/2FA requirement for moderation actions */

  NONE = 0,
  /** guild has a 2FA requirement for moderation actions */
  ELEVATED = 1
}

export enum VerificationLevel {
  /** unrestricted */
  NONE = 0,
  /** must have verified email on account */
  LOW = 1,
  /** must be registered on Discord for longer than 5 minutes */
  MEDIUM = 2,
  /** must be a member of the server for longer than 10 minutes */
  HIGH = 3,
  /** must have a verified phone number */
  VERY_HIGH = 4
}

export enum GuildNSFWLevel {
  DEFAULT = 0,
  EXPLICIT = 1,
  SAFE = 2,
  AGE_RESTRICTED = 3
}

export enum PremiumTier {
  /** guild has not unlocked any Server Boost perks */
  NONE = 0,
  /** guild has unlocked Server Boost level 1 perks */
  TIER_1 = 1,
  /** guild has unlocked Server Boost level 2 perks */
  TIER_2 = 2,
  /** guild has unlocked Server Boost level 3 perks */
  TIER_3 = 3
}

export enum SystemChannelFlags {
  /** Suppress member join notifications */
  SUPPRESS_JOIN_NOTIFICATIONS = 1 << 0,
  /** Suppress server boost notifications */
  SUPPRESS_PREMIUM_SUBSCRIPTIONS = 1 << 1,
  /** Suppress server setup tips */
  SUPPRESS_GUILD_REMINDER_NOTIFICATIONS = 1 << 2,
  /** Hide member join sticker reply buttons */
  SUPPRESS_JOIN_NOTIFICATION_REPLIES = 1 << 3
}

export interface WelcomeScreen {
  /** the server description shown in the welcome screen */
  description?: string;
  /** the channels shown in the welcome screen, up to 5 */
  welcomeChannels: WelcomeChannel[];
}

export const welcomeChannel = z.object({
  /** the channel's id */
  channelId: z.string().min(1),
  /** the description shown for the channel */
  description: z.string().min(1),
  /** the emoji id, if the emoji is custom */
  emojiId: z.string().min(1).optional(),
  /** the emoji name if custom, the unicode character if standard, or null if no emoji is set */
  emojiName: z.string().min(1).optional()
});

export type WelcomeChannel = z.infer<typeof welcomeChannel>;

export interface Presence {
  /** the user presence is being updated for */
  user: User;
  /** id of the guild */
  guildId: string;
  /** either "idle", "dnd", "online", or "offline" */
  status: "idle" | "dnd" | "online" | "offline";
  /** user's current activities */
  activities: Activity[];
  /** user's platform-dependent status */
  clientStatus: ClientStatus;
}

export interface Activity {
  /** the activity's name */
  name: string;
  /** activity type */
  type: number;
  /** stream url, is validated when type is 1 */
  url?: string;
  /** unix timestamp (in milliseconds) of when the activity was added to the user's session */
  createdAt: number;
  /** unix timestamps for start and/or end of the game */
  timestamps?: ActivityTimestamps;
  /** application id for the game */
  applicationId?: string;
  /** what the player is currently doing */
  details?: string;
  /** the user's current party status */
  state?: string;
  /** the emoji used for a custom status */
  emoji?: ActivityEmoji;
  /** information for the current party of the player */
  party?: ActivityParty;
  /** images for the presence and their hover texts */
  assets?: ActivityAssets;
  /** secrets for Rich Presence joining and spectating */
  secrets?: ActivitySecrets;
  /** whether or not the activity is an instanced game session */
  instance?: boolean;
  /** activity flags ORd together, describes what the payload includes */
  flags?: ActivityFlags;
  /** the custom buttons shown in the Rich Presence (max 2) */
  buttons?: ActivityButton[];
}

export interface ActivityTimestamps {
  /** unix time (in milliseconds) of when the activity started */
  start?: number;
  /** unix time (in milliseconds) of when the activity ends */
  end?: number;
}

export interface ActivityEmoji {
  /** the name of the emoji */
  name: string;
  /** the id of the emoji */
  id?: string;
  /** whether this emoji is animated */
  animated?: boolean;
}

export interface ActivityParty {
  /** the id of the party */
  id?: string;
  /** (current_size, max_size)	used to show the party's current and maximum size */
  size?: [currentSize: number, maxSize: number];
}

export interface ActivityAssets {
  /** see Activity Asset Image */
  largeImage?: string;
  /** text displayed when hovering over the large image of the activity */
  largeText?: string;
  /** see Activity Asset Image */
  smallImage?: string;
  /** text displayed when hovering over the small image of the activity */
  smallText?: string;
}

export interface ActivitySecrets {
  /** the secret for joining a party */
  join?: string;
  /** the secret for spectating a game */
  spectate?: string;
  /** the secret for a specific instanced match */
  match?: string;
}

export enum ActivityFlags {
  INSTANCE = 1 << 0,
  JOIN = 1 << 1,
  SPECTATE = 1 << 2,
  JOIN_REQUEST = 1 << 3,
  SYNC = 1 << 4,
  PLAY = 1 << 5,
  PARTY_PRIVACY_FRIENDS = 1 << 6,
  PARTY_PRIVACY_VOICE_CHANNEL = 1 << 7,
  EMBEDDED = 1 << 8
}

/** When received over the gateway, the buttons field is an array of strings, which are the button labels. Bots cannot access a user's activity button URLs. When sending, the buttons field must be an array of the below object: */
export interface ActivityButton {
  /** the text shown on the button (1-32 characters) */
  label: string;
  /** the url opened when clicking the button (1-512 characters) */
  url: string;
}

/** Active sessions are indicated with an "online", "idle", or "dnd" string per platform. If a user is offline or invisible, the corresponding field is not present. */
export interface ClientStatus {
  /** the user's status set for an active desktop (Windows, Linux, Mac) application session */
  desktop?: string;
  /** the user's status set for an active mobile (iOS, Android) application session */
  mobile?: string;
  /** the user's status set for an active web (browser, bot account) application session */
  web?: string;
}

export const roleTag = z.object({
  /** the id of the bot this role belongs to */
  botId: z.string().min(1),
  /** the id of the integration this role belongs to */
  integrationId: z.string().min(1),
  /** whether this is the guild's premium subscriber role */
  premiumSubscriber: z.null()
});

export type RoleTag = z.infer<typeof roleTag>;

export const role = z.object({
  /** role id */
  id: z.string().min(1),
  /** role name */
  name: z.string().min(1),
  /** integer representation of hexadecimal color code */
  color: z.number(),
  /** if this role is pinned in the user listing */
  hoist: z.boolean(),
  /** role icon hash */
  icon: z.string().min(1).optional(),
  /** role unicode emoji */
  unicodeEmoji: z.string().min(1).optional(),
  /** position of this role */
  position: z.number(),
  /** permission bit set */
  permissions: z.string().min(1),
  /** whether this role is managed by an integration */
  managed: z.boolean(),
  /** whether this role is mentionable */
  mentionable: z.boolean(),
  /** the tags this role has */
  tags: z.array(roleTag).optional()
});

export type Role = z.infer<typeof role>;

export interface Integration {
  /** integration id */
  id: string;
  /** integration name */
  name: string;
  /** integration type (twitch, youtube, or discord) */
  type: string;
  /** is this integration enabled */
  enabled?: boolean;
  /** is this integration syncing */
  syncing?: boolean;
  /** id that this integration uses for "subscribers" */
  roleId?: string;
  /** whether emoticons should be synced for this integration (twitch only currently) */
  enableEmoticons?: boolean;
  /** the behavior of expiring subscribers */
  expireBehavior?: IntegrationExpireBehavior;
  /** the grace period (in days) before expiring subscribers */
  expireGracePeriod?: number;
  /** user for this integration */
  user?: User;
  /** integration account information */
  account: IntegrationAccount;
  /** when this integration was last synced */
  syncedAt?: string;
  /** how many subscribers this integration has */
  subscriberCount?: number;
  /** has this integration been revoked */
  revoked?: boolean;
  /** The bot/OAuth2 application for discord integrations */
  application?: IntegrationApplication;
}

export enum IntegrationExpireBehavior {
  REMOVE_ROLE = 0,
  KICK = 1
}

export interface IntegrationAccount {
  /** id of the account */
  id: string;
  /** name of the account */
  name: string;
}

export interface IntegrationApplication {
  /** the id of the app */
  id: string;
  /** the name of the app */
  name: string;
  /** the icon hash of the app */
  icon?: string;
  /** the description of the app */
  description: string;
  /** the bot associated with this application */
  bot?: User;
}

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

export interface Ban {
  /** the reason for the ban */
  reason: string | null;
  /** the banned user */
  user: User;
}

export const guildWidget = z.object({
  /** whether the widget is enabled */
  enabled: z.boolean(),
  /** the widget channel id */
  channelId: z.string().min(1).nullable()
});

export type GuildWidget = z.infer<typeof guildWidget>;
