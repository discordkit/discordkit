import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Channel } from "./types/Channel.js";

export const getChannelSchema = v.object({
  channel: snowflake
});

/**
 * ### [Get Channel](https://discord.com/developers/docs/resources/channel#get-channel)
 *
 * **GET** `/channels/:channel`
 *
 * Get a channel by ID. Returns a {@link Channel | channel object}.  If the channel is a thread, a {@link ThreadMember | thread member object} is included in the returned result.
 */
export const getChannel: Fetcher<typeof getChannelSchema, Channel> = async ({
  channel
}) => get(`/channels/${channel}`);
