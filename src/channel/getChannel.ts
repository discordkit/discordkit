import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { channelSchema, type Channel } from "./types/Channel.ts";

export const getChannelSchema = z.object({
  channel: z.string().min(1)
});

/**
 * ### [Get Channel](https://discord.com/developers/docs/resources/channel#get-channel)
 *
 * **GET** `/channels/:channel`
 *
 * Get a channel by ID. Returns a {@link Channel | channel object}. If the channel is a thread, a thread member object is included in the returned result.
 */
export const getChannel: Fetcher<typeof getChannelSchema, Channel> = async ({
  channel
}) => get(`/channels/${channel}`);

export const getChannelProcedure = toProcedure(
  `query`,
  getChannel,
  getChannelSchema,
  channelSchema
);

export const getChannelQuery = toQuery(getChannel);
