import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { channelSchema, type Channel } from "#/channel/types/Channel.ts";

export const getGuildChannelsSchema = z.object({
  guild: z.string().min(1)
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

export const getGuildChannelsProcedure = toProcedure(
  `query`,
  getGuildChannels,
  getGuildChannelsSchema,
  channelSchema.array()
);

export const getGuildChannelsQuery = toQuery(getGuildChannels);
