// https://discord.com/developers/docs/resources/channel#channel-object-channel-types

import { z } from "zod";

export enum ChannelType {
  /** a text channel within a server */
  GUILD_TEXT = 0,
  /** a direct message between users */
  DM = 1,
  /** a voice channel within a server */
  GUILD_VOICE = 2,
  /** a direct message between multiple users */
  GROUP_DM = 3,
  /** an organizational category that contains up to 50 channels */
  GUILD_CATEGORY = 4,
  /** a channel that users can follow and crosspost into their own server */
  GUILD_ANNOUNCEMENT = 5,
  /** a temporary sub-channel within a GUILD_ANNOUNCEMENT channel */
  ANNOUNCEMENT_THREAD = 10,
  /** a temporary sub-channel within a GUILD_TEXT channel */
  PUBLIC_THREAD = 11,
  /** a temporary sub-channel within a GUILD_TEXT channel that is only viewable by those invited and those with the MANAGE_THREADS permission */
  PRIVATE_THREAD = 12,
  /** a voice channel for hosting events with an audience */
  GUILD_STAGE_VOICE = 13,
  /** the channel in a hub containing the listed servers */
  GUILD_DIRECTORY = 14,
  /** a channel that can only contain threads */
  GUILD_FORUM = 15,
  /** Channel that can only contain threads, similar to GUILD_FORUM channels */
  GUILD_MEDIA = 16
}

export const channelTypeSchema = z.nativeEnum(ChannelType);
