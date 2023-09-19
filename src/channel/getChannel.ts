import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { channelSchema, type Channel } from "./types";

export const getChannelSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Get a channel by ID. Returns a channel object. If the channel is a thread, a thread member object is included in the returned result.
 *
 * https://discord.com/developers/docs/resources/channel#get-channel
 */
export const getChannel: Fetcher<typeof getChannelSchema, Channel> = async ({
  channel
}) => get(`/channels/${channel}`);

export const getChannelProcedure = createProcedure(
  `query`,
  getChannel,
  getChannelSchema,
  channelSchema
);
