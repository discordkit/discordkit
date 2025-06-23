// https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes

import { union, literal, type InferOutput } from "valibot";

export const scopesSchema = union([
  /** allows your app to fetch data from a user's "Now Playing/Recently Played" list - requires Discord approval */
  literal(`activities.read`),
  /** allows your app to update a user's activity - requires Discord approval (NOT REQUIRED FOR GAMESDK ACTIVITY MANAGER) */
  literal(`activities.write`),
  /** allows your app to read build data for a user's applications */
  literal(`applications.builds.read`),
  /** allows your app to upload/update builds for a user's applications - requires Discord approval */
  literal(`applications.builds.upload`),
  /** allows your app to use commands in a guild */
  literal(`applications.commands`),
  /** allows your app to update its commands using a Bearer token - client credentials grant only */
  literal(`applications.commands.update`),
  /** allows your app to update permissions for its commands in a guild a user has permissions to */
  literal(`applications.commands.permissions.update`),
  /** allows your app to read entitlements for a user's applications */
  literal(`applications.entitlements`),
  /** allows your app to read and update store data (SKUs, store listings, achievements, etc.) for a user's applications */
  literal(`applications.store.update`),
  /** for oauth2 bots, this puts the bot in the user's selected guild by default */
  literal(`bot`),
  /** allows `/users/@me/connections` to return linked third-party accounts */
  literal(`connections`),
  /** allows your app to see information about the user's DMs and group DMs - requires Discord approval */
  literal(`dm_channels.read`),
  /** enables `/users/@me` to return an email */
  literal(`email`),
  /** allows your app to join users to a group dm */
  literal(`gdm.join`),
  /** allows `/users/@me/guilds` to return basic information about all of a user's guilds */
  literal(`guilds`),
  /** allows `/guilds/{guild.id}/members/{user.id}` to be used for joining users to a guild */
  literal(`guilds.join`),
  /** allows `/users/@me/guilds/{guild.id}/member` to return a user's member information in a guild */
  literal(`guilds.members.read`),
  /** allows `/users/@me` without email */
  literal(`identify`),
  /** for local rpc server api access, this allows you to read messages from all client channels (otherwise restricted to channels/guilds your app creates) */
  literal(`messages.read`),
  /** allows your app to know a user's friends and implicit relationships - requires Discord approval */
  literal(`relationships.read`),
  /** allows your app to update a user's connection and metadata for the app */
  literal(`role_connections.write`),
  /** for local rpc server access, this allows you to control a user's local Discord client - requires Discord approval */
  literal(`rpc`),
  /** for local rpc server access, this allows you to update a user's activity - requires Discord approval */
  literal(`rpc.activities.write`),
  /** for local rpc server access, this allows you to receive notifications pushed out to the user - requires Discord approval */
  literal(`rpc.notifications.read`),
  /** for local rpc server access, this allows you to read a user's voice settings and listen for voice events - requires Discord approval */
  literal(`rpc.voice.read`),
  /** for local rpc server access, this allows you to update a user's voice settings - requires Discord approval */
  literal(`rpc.voice.write`),
  /** allows your app to connect to voice on user's behalf and see all the voice members - requires Discord approval */
  literal(`voice`),
  /** this generates a webhook that is returned in the oauth token response for authorization code grants */
  literal(`webhook.incoming`)
]);

export type Scopes = InferOutput<typeof scopesSchema>;
