// https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes

import { z } from "zod";

export const scopes = z.union([
  /** allows your app to fetch data from a user's "Now Playing/Recently Played" list - requires Discord approval */
  z.literal(`activities.read`),
  /** allows your app to update a user's activity - requires Discord approval (NOT REQUIRED FOR GAMESDK ACTIVITY MANAGER) */
  z.literal(`activities.write`),
  /** allows your app to read build data for a user's applications */
  z.literal(`applications.builds.read`),
  /** allows your app to upload/update builds for a user's applications - requires Discord approval */
  z.literal(`applications.builds.upload`),
  /** allows your app to use commands in a guild */
  z.literal(`applications.commands`),
  /** allows your app to update its commands using a Bearer token - client credentials grant only */
  z.literal(`applications.commands.update`),
  /** allows your app to update permissions for its commands in a guild a user has permissions to */
  z.literal(`applications.commands.permissions.update`),
  /** allows your app to read entitlements for a user's applications */
  z.literal(`applications.entitlements`),
  /** allows your app to read and update store data (SKUs, store listings, achievements, etc.) for a user's applications */
  z.literal(`applications.store.update`),
  /** for oauth2 bots, this puts the bot in the user's selected guild by default */
  z.literal(`bot`),
  /** allows /users/@me/connections to return linked third-party accounts */
  z.literal(`connections`),
  /** allows your app to see information about the user's DMs and group DMs - requires Discord approval */
  z.literal(`dm_channels.read`),
  /** enables /users/@me to return an email */
  z.literal(`email`),
  /** allows your app to join users to a group dm */
  z.literal(`gdm.join`),
  /** allows /users/@me/guilds to return basic information about all of a user's guilds */
  z.literal(`guilds`),
  /** allows /guilds/{guild.id}/members/{user.id} to be used for joining users to a guild */
  z.literal(`guilds.join`),
  /** allows /users/@me/guilds/{guild.id}/member to return a user's member information in a guild */
  z.literal(`guilds.members.read`),
  /** allows /users/@me without email */
  z.literal(`identify`),
  /** for local rpc server api access, this allows you to read messages from all client channels (otherwise restricted to channels/guilds your app creates) */
  z.literal(`messages.read`),
  /** allows your app to know a user's friends and implicit relationships - requires Discord approval */
  z.literal(`relationships.read`),
  /** for local rpc server access, this allows you to control a user's local Discord client - requires Discord approval */
  z.literal(`rpc`),
  /** for local rpc server access, this allows you to update a user's activity - requires Discord approval */
  z.literal(`rpc.activities.write`),
  /** for local rpc server access, this allows you to receive notifications pushed out to the user - requires Discord approval */
  z.literal(`rpc.notifications.read`),
  /** for local rpc server access, this allows you to read a user's voice settings and listen for voice events - requires Discord approval */
  z.literal(`rpc.voice.read`),
  /** for local rpc server access, this allows you to update a user's voice settings - requires Discord approval */
  z.literal(`rpc.voice.write`),
  /** allows your app to connect to voice on user's behalf and see all the voice members - requires Discord approval */
  z.literal(`voice`),
  /** this generates a webhook that is returned in the oauth token response for authorization code grants */
  z.literal(`webhook.incoming`)
]);

export type Scopes = z.infer<typeof scopes>;
