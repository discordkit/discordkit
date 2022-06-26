/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import type { User } from "../user/types";

// https://discord.com/developers/docs/resources/application#application-object-application-structure
export interface Application {
  /** the id of the app */
  id: string;
  /** the name of the app */
  name: string;
  /** the icon hash of the app */
  icon?: string;
  /** the description of the app */
  description: string;
  /** an array of rpc origin urls, if rpc is enabled */
  rpcOrigins?: string[];
  /** when false only app owner can join the app's bot to guilds */
  botPublic: boolean;
  /** when true the app's bot will only join upon completion of the full oauth2 code grant flow */
  botRequireCodeGrant: boolean;
  /** the url of the app's terms of service */
  termsOfServiceUrl?: string;
  /** the url of the app's privacy policy */
  privacyPolicyUrl?: string;
  /** partial user object containing info on the owner of the application */
  owner?: Partial<User>;
  /** the hex encoded key for verification in interactions and the GameSDK's GetTicket */
  verifyKey: string;
  /** if the application belongs to a team, this will be a list of the members of that team */
  team?: Team;
  /** if this application is a game sold on Discord, this field will be the guild to which it has been linked */
  guildId?: string;
  /** if this application is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists */
  primarySkuId?: string;
  /** if this application is a game sold on Discord, this field will be the URL slug that links to the store page */
  slug?: string;
  /** the application's default rich presence invite cover image hash */
  coverImage?: string;
  /** the application's public flags */
  flags?: ApplicationFlags;
  /** up to 5 tags describing the content and functionality of the application */
  tags?: string[];
  /** settings for the application's default in-app authorization link, if enabled */
  installParams?: InstallParams;
  /** the application's default custom authorization link, if enabled */
  customInstallUrl?: string;
}

// https://discord.com/developers/docs/resources/application#application-object-application-flags
export enum ApplicationFlags {
  /** Intent required for bots in 100 or more servers to receive presence_update events */
  GATEWAY_PRESENCE = 1 << 12,
  /** Intent required for bots in under 100 servers to receive presence_update events, found in Bot Settings */
  GATEWAY_PRESENCE_LIMITED = 1 << 13,
  /** Intent required for bots in 100 or more servers to receive member-related events like guild_member_add. See list of member-related events under GUILD_MEMBERS */
  GATEWAY_GUILD_MEMBERS = 1 << 14,
  /** Intent required for bots in under 100 servers to receive member-related events like guild_member_add, found in Bot Settings. See list of member-related events under GUILD_MEMBERS */
  GATEWAY_GUILD_MEMBERS_LIMITED = 1 << 15,
  /** Indicates unusual growth of an app that prevents verification */
  VERIFICATION_PENDING_GUILD_LIMIT = 1 << 16,
  /** Indicates if an app is embedded within the Discord client (currently unavailable publicly) */
  EMBEDDED = 1 << 17,
  /** Intent required for bots in 100 or more servers to receive message content */
  GATEWAY_MESSAGE_CONTENT = 1 << 18,
  /** Intent required for bots in under 100 servers to receive message content, found in Bot Settings */
  GATEWAY_MESSAGE_CONTENT_LIMITED = 1 << 19
}

// https://discord.com/developers/docs/topics/teams#data-models-team-object
export interface Team {
  /** a hash of the image of the team's icon */
  icon?: string;
  /** the unique id of the team */
  id: string;
  /** the members of the team */
  members: TeamMember[];
  /** the name of the team */
  name: string;
  /** the user id of the current team owner */
  ownerUserId: string;
}

// https://discord.com/developers/docs/topics/teams#data-models-team-member-object
export interface TeamMember {
  /** the user's membership state on the team */
  membershipState: MembershipState;
  /** will always be ["*"] */
  permissions: string[];
  /** the id of the parent team of which they are a member */
  teamId: string;
  /** partial user object	the avatar, discriminator, id, and username of the user */
  user: Partial<User>;
}

// https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum
export enum MembershipState {
  INVITED = 1,
  ACCEPTED = 2
}

// https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure
export interface InstallParams {
  /** the scopes to add the application to the server with */
  scopes: Scopes[];
  /** the permissions to request for the bot role */
  permissions: string;
}

// https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
export type Scopes =
  /** allows your app to fetch data from a user's "Now Playing/Recently Played" list - requires Discord approval */
  | `activities.read`
  /** allows your app to update a user's activity - requires Discord approval (NOT REQUIRED FOR GAMESDK ACTIVITY MANAGER) */
  | `activities.write`
  /** allows your app to read build data for a user's applications */
  | `applications.builds.read`
  /** allows your app to upload/update builds for a user's applications - requires Discord approval */
  | `applications.builds.upload`
  /** allows your app to use commands in a guild */
  | `applications.commands`
  /** allows your app to update its commands using a Bearer token - client credentials grant only */
  | `applications.commands.update`
  /** allows your app to update permissions for its commands in a guild a user has permissions to */
  | `applications.commands.permissions.update`
  /** allows your app to read entitlements for a user's applications */
  | `applications.entitlements`
  /** allows your app to read and update store data (SKUs, store listings, achievements, etc.) for a user's applications */
  | `applications.store.update`
  /** for oauth2 bots, this puts the bot in the user's selected guild by default */
  | `bot`
  /** allows /users/@me/connections to return linked third-party accounts */
  | `connections`
  /** allows your app to see information about the user's DMs and group DMs - requires Discord approval */
  | `dm_channels.read`
  /** enables /users/@me to return an email */
  | `email`
  /** allows your app to join users to a group dm */
  | `gdm.join`
  /** allows /users/@me/guilds to return basic information about all of a user's guilds */
  | `guilds`
  /** allows /guilds/{guild.id}/members/{user.id} to be used for joining users to a guild */
  | `guilds.join`
  /** allows /users/@me/guilds/{guild.id}/member to return a user's member information in a guild */
  | `guilds.members.read`
  /** allows /users/@me without email */
  | `identify`
  /** for local rpc server api access, this allows you to read messages from all client channels (otherwise restricted to channels/guilds your app creates) */
  | `messages.read`
  /** allows your app to know a user's friends and implicit relationships - requires Discord approval */
  | `relationships.read`
  /** for local rpc server access, this allows you to control a user's local Discord client - requires Discord approval */
  | `rpc`
  /** for local rpc server access, this allows you to update a user's activity - requires Discord approval */
  | `rpc.activities.write`
  /** for local rpc server access, this allows you to receive notifications pushed out to the user - requires Discord approval */
  | `rpc.notifications.read`
  /** for local rpc server access, this allows you to read a user's voice settings and listen for voice events - requires Discord approval */
  | `rpc.voice.read`
  /** for local rpc server access, this allows you to update a user's voice settings - requires Discord approval */
  | `rpc.voice.write`
  /** allows your app to connect to voice on user's behalf and see all the voice members - requires Discord approval */
  | `voice`
  /** this generates a webhook that is returned in the oauth token response for authorization code grants */
  | `webhook.incoming`;
