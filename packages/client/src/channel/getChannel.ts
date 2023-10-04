import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { channelSchema, type Channel } from "./types/Channel.js";

export const getChannelSchema = z.object({
  channel: snowflake
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

export const getChannelSafe = toValidated(
  getChannel,
  getChannelSchema,
  channelSchema
);

export const getChannelProcedure = toProcedure(
  `query`,
  getChannel,
  getChannelSchema,
  channelSchema
);

export const getChannelQuery = toQuery(getChannel);
