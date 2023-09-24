import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { channelSchema, type Channel } from "../channel/types/Channel";

export const getGuildChannelsSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of guild channel objects. Does not include threads.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-channels
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
