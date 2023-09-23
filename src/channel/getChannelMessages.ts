import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { messageSchema, type Message } from "./types/Message";

export const getChannelMessagesSchema = z.object({
  channel: z.string().min(1),
  params: z
    .object({
      /** Get messages around this message ID */
      around: z.string().min(1),
      /** Get messages before this message ID */
      before: z.string().min(1),
      /** Get messages after this message ID */
      after: z.string().min(1),
      /** Max number of messages to return (1-100) Default: 50 */
      limit: z.number().min(1).max(100)
    })
    .partial()
    .optional()
});

/**
 * Returns the messages for a channel. If operating on a guild channel, this endpoint requires the `VIEW_CHANNEL` permission to be present on the current user. If the current user is missing the `READ_MESSAGE_HISTORY` permission in the channel then this will return no messages (since they cannot read the message history). Returns an array of message objects on success.
 *
 * *The `before`, `after`, and `around` parameters are mutually exclusive, only one may be passed at a time.*
 *
 * https://discord.com/developers/docs/resources/channel#get-channel-messages
 */
export const getChannelMessages: Fetcher<
  typeof getChannelMessagesSchema,
  Message[]
> = async ({ channel, params }) => get(`/channels/${channel}/messages`, params);

export const getChannelMessagesProcedure = toProcedure(
  `query`,
  getChannelMessages,
  getChannelMessagesSchema,
  messageSchema.array()
);

export const getChannelMessagesQuery = toQuery(getChannelMessages);
