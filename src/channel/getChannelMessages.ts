import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "#/utils/index.ts";
import { messageSchema, type Message } from "./types/Message.ts";

export const getChannelMessagesSchema = z.object({
  channel: z.string().min(1),
  params: z
    .object({
      /** Get messages around this message ID */
      around: z.string().min(1).nullable(),
      /** Get messages before this message ID */
      before: z.string().min(1).nullable(),
      /** Get messages after this message ID */
      after: z.string().min(1).nullable(),
      /** Max number of messages to return (1-100) Default: 50 */
      limit: z.number().min(1).max(100).nullable().default(50)
    })
    .partial()
    .optional()
});

/**
 * ### [Get Channel Messages](https://discord.com/developers/docs/resources/channel#get-channel-messages)
 *
 * **GET** `/channels/:channel/messages`
 *
 * Retrieves the messages in a channel. Returns an array of {@link Message | message objects} on success.
 *
 * If operating on a guild channel, this endpoint requires the current user to have the `VIEW_CHANNEL` permission. If the channel is a voice channel, they must also have the `CONNECT` permission.
 *
 * If the current user is missing the `READ_MESSAGE_HISTORY` permission in the channel, then no messages will be returned.
 *
 * > **NOTE**
 * >
 * > The `before`, `after`, and `around` parameters are mutually exclusive, only one may be passed at a time.
 */
export const getChannelMessages: Fetcher<
  typeof getChannelMessagesSchema,
  Message[]
> = async ({ channel, params }) => get(`/channels/${channel}/messages`, params);

export const getChannelMessagesSafe = toValidated(
  getChannelMessages,
  getChannelMessagesSchema,
  messageSchema.array()
);

export const getChannelMessagesProcedure = toProcedure(
  `query`,
  getChannelMessages,
  getChannelMessagesSchema,
  messageSchema.array()
);

export const getChannelMessagesQuery = toQuery(getChannelMessages);
