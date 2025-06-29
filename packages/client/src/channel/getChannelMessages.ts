import {
  object,
  array,
  integer,
  minValue,
  maxValue,
  number,
  nullish,
  partial,
  exactOptional,
  pipe
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { messageSchema, type Message } from "../messages/types/Message.js";

export const getChannelMessagesSchema = object({
  channel: snowflake,
  params: exactOptional(
    partial(
      object({
        /** Get messages around this message ID */
        around: nullish(snowflake),
        /** Get messages before this message ID */
        before: nullish(snowflake),
        /** Get messages after this message ID */
        after: nullish(snowflake),
        /** Max number of messages to return (1-100) Default: 50 */
        limit: nullish(
          pipe(number(), integer(), minValue(1), maxValue(100)),
          50
        )
      })
    )
  )
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
 * > [!NOTE]
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
  array(messageSchema)
);

export const getChannelMessagesProcedure = toProcedure(
  `query`,
  getChannelMessages,
  getChannelMessagesSchema,
  array(messageSchema)
);

export const getChannelMessagesQuery = toQuery(getChannelMessages);
