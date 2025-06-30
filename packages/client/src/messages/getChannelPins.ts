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
import { messagePinSchema, type MessagePin } from "./types/MessagePin.js";

export const getChannelPinsSchema = object({
  channel: snowflake,
  params: exactOptional(
    partial(
      object({
        /** Get messages pinned before this timestamp */
        before: nullish(snowflake),
        /** Max number of pins to return (1-50) */
        limit: nullish(pipe(number(), integer(), minValue(1), maxValue(50)), 50)
      })
    )
  )
});

/**
 * ### [Get Channel Messages](https://discord.com/developers/docs/resources/channel#get-channel-messages)
 *
 * **GET** `/channels/:channel/messages/pins`
 *
 * Retrieves the list of pins in a channel. Requires the `VIEW_CHANNEL` permission. If the user is missing the `READ_MESSAGE_HISTORY` permission in the channel, then no pins will be returned.
 */
export const getChannelPins: Fetcher<
  typeof getChannelPinsSchema,
  MessagePin[]
> = async ({ channel, params }) =>
  get(`/channels/${channel}/messages/pins`, params);

export const getChannelPinsSafe = toValidated(
  getChannelPins,
  getChannelPinsSchema,
  array(messagePinSchema)
);

export const getChannelPinsProcedure = toProcedure(
  `query`,
  getChannelPins,
  getChannelPinsSchema,
  array(messagePinSchema)
);

export const getChannelPinsQuery = toQuery(getChannelPins);
