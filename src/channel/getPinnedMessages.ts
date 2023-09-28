import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { messageSchema, type Message } from "./types/Message.ts";

export const getPinnedMessagesSchema = z.object({
  channel: z.string().min(1)
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

export const getPinnedMessagesProcedure = toProcedure(
  `query`,
  getPinnedMessages,
  getPinnedMessagesSchema,
  messageSchema.array()
);

export const getPinnedMessagesQuery = toQuery(getPinnedMessages);
