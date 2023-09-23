import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { messageSchema, type Message } from "./types/Message";

export const getPinnedMessagesSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Returns all pinned messages in the channel as an array of message objects.
 *
 * https://discord.com/developers/docs/resources/channel#get-pinned-messages
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
