import type { Channel } from "../../channel";
import type { Emoji } from "../../emoji";
import type { ScheduledEvent } from "../../event";
import type { Stage } from "../../stage";
import type { Sticker } from "../../sticker";
import type { VoiceState } from "../../voice";
import type { Role } from "./Role";
import type { Presence } from "./Presence";
import type { WelcomeScreen } from "./WelcomeScreen";
import type { SystemChannelFlags } from "./SystemChannelFlags";
import type { PremiumTier } from "./PremiumTier";
import type { GuildNSFWLevel } from "./GuildNSFWLevel";
import type { VerificationLevel } from "./VerificationLevel";
import type { MFALevel } from "./MFALevel";
import type { ExplicitContentFilterLevel } from "./ExplicitContentFilterLevel";
import type { DefaultMessageNotificationLevel } from "./DefaultMessageNotificationLevel";
import type { GuildFeatures } from "./GuildFeatures";
import type { Member } from "./Member";

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
