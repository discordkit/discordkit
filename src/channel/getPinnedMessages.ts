import { z } from "zod";
import { query, get } from "../utils";
import type { Message } from "./types";

export const getPinnedMessagesSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Returns all pinned messages in the channel as an array of message objects.
 *
 * https://discord.com/developers/docs/resources/channel#get-pinned-messages
 */
export const getPinnedMessages = query(
  getPinnedMessagesSchema,
  async ({ input: { channel } }) => get<Message[]>(`/channels/${channel}/pins`)
);
