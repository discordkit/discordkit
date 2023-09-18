import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Message } from "./types";

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
