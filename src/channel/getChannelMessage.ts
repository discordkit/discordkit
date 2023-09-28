import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { messageSchema, type Message } from "./types/Message.ts";

export const getChannelMessageSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1)
});

/**
 * ### [Get Channel Message](https://discord.com/developers/docs/resources/channel#get-channel-message)
 *
 * **GET** `/channels/:channel/messages/:message`
 *
 * Retrieves a specific message in the channel. Returns a {@link Message | message object} on success.
 *
 * If operating on a guild channel, this endpoint requires the current user to have the `VIEW_CHANNEL` and `READ_MESSAGE_HISTORY` permissions. If the channel is a voice channel, they must also have the `CONNECT` permission.
 */
export const getChannelMessage: Fetcher<
  typeof getChannelMessageSchema,
  Message
> = async ({ channel, message }) =>
  get(`/channels/${channel}/messages/${message}`);

export const getChannelMessageProcedure = toProcedure(
  `query`,
  getChannelMessage,
  getChannelMessageSchema,
  messageSchema
);

export const getChannelMessageQuery = toQuery(getChannelMessage);
