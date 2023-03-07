import { z } from "zod";
import { mutation, post } from "../utils";
import { ChannelType, autoArchiveDuration, type Channel } from "./types";

export const startThreadWithoutMessageSchema = z.object({
  channel: z.string().min(1),
  body: z.object({
    /** 1-100 character channel name */
    name: z.string().min(1).max(100),
    /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
    autoArchiveDuration: autoArchiveDuration.optional(),
    /** the type of thread to create */
    type: z.nativeEnum(ChannelType).optional(),
    /** whether non-moderators can add other non-moderators to a thread; only available when creating a private thread */
    invitable: z.boolean().optional(),
    /** amount of seconds a user has to wait before sending another message (0-21600) */
    rateLimitPerUser: z.number().min(0).max(21600).optional()
  })
});

/**
 * Creates a new thread that is not connected to an existing message. Returns a channel on success, and a `400 BAD REQUEST` on invalid parameters. Fires a [Thread Create](https://discord.com/developers/docs/topics/gateway#thread-create) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * *Creating a private thread requires the server to be boosted. The [guild features](https://discord.com/developers/docs/resources/guild#guild-object-guild-features) will indicate if that is possible for the guild.*
 *
 * https://discord.com/developers/docs/resources/channel#start-thread-without-message
 */
export const startThreadWithoutMessage = mutation(startThreadWithoutMessageSchema, async ({ channel, body }) =>
  post<Channel>(`/channels/${channel}/threads`, body)
);
