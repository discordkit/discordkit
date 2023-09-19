import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { messageSchema, type Message } from "./types";

export const getChannelMessageSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1)
});

/**
 * Returns a specific message in the channel. If operating on a guild channel, this endpoint requires the `READ_MESSAGE_HISTORY` permission to be present on the current user. Returns a message object on success.
 *
 * https://discord.com/developers/docs/resources/channel#get-channel-message
 */
export const getChannelMessage: Fetcher<
  typeof getChannelMessageSchema,
  Message
> = async ({ channel, message }) =>
  get(`/channels/${channel}/messages/${message}`);

export const getChannelMessageProcedure = createProcedure(
  `query`,
  getChannelMessage,
  getChannelMessageSchema,
  messageSchema
);
