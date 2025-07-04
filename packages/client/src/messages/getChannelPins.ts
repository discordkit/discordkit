import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake,
  boundedInteger
} from "@discordkit/core";
import { messagePinSchema, type MessagePin } from "./types/MessagePin.js";

export const getChannelPinsSchema = v.object({
  channel: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** Get messages pinned before this timestamp */
        before: v.nullish(snowflake),
        /** Max number of pins to return (1-50) */
        limit: v.nullish(boundedInteger({ min: 1, max: 100 }))
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
  v.array(messagePinSchema)
);

export const getChannelPinsProcedure = toProcedure(
  `query`,
  getChannelPins,
  getChannelPinsSchema,
  v.array(messagePinSchema)
);

export const getChannelPinsQuery = toQuery(getChannelPins);
