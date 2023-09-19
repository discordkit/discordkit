import { z } from "zod";
import {
  autoArchiveDurationSchema,
  channelSchema,
  type Channel
} from "./types";
import { post, type Fetcher, createProcedure } from "../utils";

export const startThreadFromMessageSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1),
  body: z.object({
    /** 1-100 character channel name */
    name: z.string().min(1).max(100),
    /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
    autoArchiveDuration: autoArchiveDurationSchema.optional(),
    /** amount of seconds a user has to wait before sending another message (0-21600) */
    rateLimitPerUser: z.number().min(0).max(21600)
  })
});

/**
 * Creates a new thread from an existing message. Returns a channel on success, and a `400 BAD REQUEST` on invalid parameters. Fires a [Thread Create](https://discord.com/developers/docs/topics/gateway#thread-create) Gateway event.
 *
 * When called on a `GUILD_TEXT` channel, creates a `GUILD_PUBLIC_THREAD`. When called on a `GUILD_NEWS` channel, creates a `GUILD_NEWS_THREAD`. Does not work on a [`GUILD_FORUM`](https://discord.com/developers/docs/resources/channel#start-thread-in-forum-channel) channel. The id of the created thread will be the same as the id of the source message, and as such a message can only have a single thread created from it.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/channel#start-thread-from-message
 */
export const startThreadFromMessage: Fetcher<
  typeof startThreadFromMessageSchema,
  Channel
> = async ({ channel, message, body }) =>
  post(`/channels/${channel}/messages/${message}/threads`, body);

export const startThreadFromMessageProcedure = createProcedure(
  `mutation`,
  startThreadFromMessage,
  startThreadFromMessageSchema,
  channelSchema
);
