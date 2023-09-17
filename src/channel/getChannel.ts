import { z } from "zod";
import { get, query } from "../utils";
import type { Channel } from "./types";

export const getChannelSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Get a channel by ID. Returns a channel object. If the channel is a thread, a thread member object is included in the returned result.
 *
 * https://discord.com/developers/docs/resources/channel#get-channel
 */
export const getChannel = query(
  getChannelSchema,
  async ({ input: { channel } }) => get<Channel>(`/channels/${channel}`)
);
