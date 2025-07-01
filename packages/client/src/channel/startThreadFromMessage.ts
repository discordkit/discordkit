import * as v from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { threadChannelSchema } from "./types/Channel.js";
import { autoArchiveDurationSchema } from "./types/AutoArchiveDuration.js";

export const startThreadFromMessageSchema = v.object({
  channel: snowflake,
  message: snowflake,
  body: v.object({
    /** 1-100 character channel name */
    name: v.pipe(v.string(), v.nonEmpty(), v.maxLength(100)),
    /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
    autoArchiveDuration: v.exactOptional(autoArchiveDurationSchema),
    /** amount of seconds a user has to wait before sending another message (0-21600) */
    rateLimitPerUser: v.nullish(
      v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(21600))
    )
  })
});

/**
 * ### [Start Thread from Message](https://discord.com/developers/docs/resources/channel#start-thread-from-message)
 *
 * **POST** `/channels/:channel/messages/:message/threads`
 *
 * Creates a new thread from an existing message. Returns a {@link Channel | channel} on success, and a `400 BAD REQUEST` on invalid parameters. Fires a Thread Create and a Message Update Gateway event.
 *
 * When called on a `GUILD_TEXT` channel, creates a `PUBLIC_THREAD`. When called on a `GUILD_ANNOUNCEMENT` channel, creates a `ANNOUNCEMENT_THREAD`. Does not work on a `GUILD_FORUM` or a `GUILD_MEDIA` channel. The id of the created thread will be the same as the id of the source message, and as such a message can only have a single thread created from it.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const startThreadFromMessage: Fetcher<
  typeof startThreadFromMessageSchema,
  v.InferOutput<typeof threadChannelSchema>
> = async ({ channel, message, body }) =>
  post(`/channels/${channel}/messages/${message}/threads`, body);

export const startThreadFromMessageSafe = toValidated(
  startThreadFromMessage,
  startThreadFromMessageSchema,
  threadChannelSchema
);

export const startThreadFromMessageProcedure = toProcedure(
  `mutation`,
  startThreadFromMessage,
  startThreadFromMessageSchema,
  threadChannelSchema
);
