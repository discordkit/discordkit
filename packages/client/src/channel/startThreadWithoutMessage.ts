import * as v from "valibot";
import {
  toProcedure,
  post,
  type Fetcher,
  toValidated,
  snowflake
} from "@discordkit/core";
import { type Channel, channelSchema } from "./types/Channel.js";
import { autoArchiveDurationSchema } from "./types/AutoArchiveDuration.js";
import { channelTypeSchema } from "./types/ChannelType.js";

export const startThreadWithoutMessageSchema = v.object({
  channel: snowflake,
  body: v.object({
    /** 1-100 character channel name */
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
    autoArchiveDuration: v.exactOptional(autoArchiveDurationSchema),
    /** the type of thread to create */
    type: v.exactOptional(channelTypeSchema),
    /** whether non-moderators can add other non-moderators to a thread; only available when creating a private thread */
    invitable: v.exactOptional(v.boolean()),
    /** amount of seconds a user has to wait before sending another message (0-21600) */
    rateLimitPerUser: v.nullish(
      v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(21600))
    )
  })
});

/**
 * ### [Start Thread without Message](https://discord.com/developers/docs/resources/channel#start-thread-without-message)
 *
 * **POST** `/channels/:channel/threads`
 *
 * Creates a new thread that is not connected to an existing message. Returns a {@link Channel | channel} on success, and a `400 BAD REQUEST` on invalid parameters. Fires a Thread Create Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const startThreadWithoutMessage: Fetcher<
  typeof startThreadWithoutMessageSchema,
  Channel
> = async ({ channel, body }) => post(`/channels/${channel}/threads`, body);

export const startThreadWithoutMessageSafe = toValidated(
  startThreadWithoutMessage,
  startThreadWithoutMessageSchema,
  channelSchema
);

export const startThreadWithoutMessageProcedure = toProcedure(
  `mutation`,
  startThreadWithoutMessage,
  startThreadWithoutMessageSchema,
  channelSchema
);
