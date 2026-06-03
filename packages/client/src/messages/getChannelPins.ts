import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type MessagePin } from "./types/MessagePin.js";

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
 * ### [Get Channel Pins](https://discord.com/developers/docs/resources/message#get-channel-pins)
 *
 * **GET** `/channels/:channel/messages/pins`
 *
 * Retrieves the list of pins in a channel. Requires the `VIEW_CHANNEL` permission. If the user is missing the `READ_MESSAGE_HISTORY` permission in the channel, then no pins will be returned.
 *
 * **Example**
 *
 * If you want to get 100 pins you'd send these two requests: `GET /channels/:id/messages/pins?limit=50` `GET /channels/:id/messages/pins?limit=50&before={pins[pins.len() - 1].pinned_at}`
 */
export const getChannelPins: Fetcher<
  typeof getChannelPinsSchema,
  MessagePin[]
> = async ({ channel, params }) =>
  get(`/channels/${channel}/messages/pins`, params);
