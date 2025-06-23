import { object, array } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { messageSchema, type Message } from "./types/Message.js";

export const getPinnedMessagesSchema = object({
  channel: snowflake
});

/**
 * ### [Get Pinned Messages](https://discord.com/developers/docs/resources/channel#get-pinned-messages)
 *
 * **GET** `/channels/:channel/pins`
 *
 * Returns all pinned messages in the channel as an array of {@link Message | message objects}.
 */
export const getPinnedMessages: Fetcher<
  typeof getPinnedMessagesSchema,
  Message[]
> = async ({ channel }) => get(`/channels/${channel}/pins`);

export const getPinnedMessagesSafe = toValidated(
  getPinnedMessages,
  getPinnedMessagesSchema,
  array(messageSchema)
);

export const getPinnedMessagesProcedure = toProcedure(
  `query`,
  getPinnedMessages,
  getPinnedMessagesSchema,
  array(messageSchema)
);

export const getPinnedMessagesQuery = toQuery(getPinnedMessages);
