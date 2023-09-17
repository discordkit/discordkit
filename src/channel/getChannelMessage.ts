import { z } from "zod";
import { get, query } from "../utils";
import type { Message } from "./types";

export const getChannelMessageSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1)
});

/**
 * Returns a specific message in the channel. If operating on a guild channel, this endpoint requires the `READ_MESSAGE_HISTORY` permission to be present on the current user. Returns a message object on success.
 *
 * https://discord.com/developers/docs/resources/channel#get-channel-message
 */
export const getChannelMessage = query(
  getChannelMessageSchema,
  async ({ input: { channel, message } }) =>
    get<Message>(`/channels/${channel}/messages/${message}`)
);
