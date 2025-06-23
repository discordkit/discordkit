import { object, array } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { channelSchema, type Channel } from "../channel/types/Channel.js";

export const getGuildChannelsSchema = object({
  guild: snowflake
});

/**
 * ### [Get Guild Channels](https://discord.com/developers/docs/resources/guild#get-guild-channels)
 *
 * **GET** `/guilds/:guild/channels`
 *
 * Returns a list of guild {@link Channel | channel objects}. Does not include threads.
 */
export const getGuildChannels: Fetcher<
  typeof getGuildChannelsSchema,
  Channel[]
> = async ({ guild }) => get(`/guilds/${guild}/channels`);

export const getGuildChannelsSafe = toValidated(
  getGuildChannels,
  getGuildChannelsSchema,
  array(channelSchema)
);

export const getGuildChannelsProcedure = toProcedure(
  `query`,
  getGuildChannels,
  getGuildChannelsSchema,
  array(channelSchema)
);

export const getGuildChannelsQuery = toQuery(getGuildChannels);
