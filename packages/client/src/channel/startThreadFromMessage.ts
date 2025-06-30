import {
  exactOptional,
  integer,
  maxLength,
  maxValue,
  minValue,
  nonEmpty,
  nullish,
  number,
  object,
  pipe,
  string
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { channelSchema, type Channel } from "./types/Channel.js";
import { autoArchiveDurationSchema } from "./types/AutoArchiveDuration.js";

export const startThreadFromMessageSchema = object({
  channel: snowflake,
  message: snowflake,
  body: object({
    /** 1-100 character channel name */
    name: pipe(string(), nonEmpty(), maxLength(100)),
    /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
    autoArchiveDuration: exactOptional(autoArchiveDurationSchema),
    /** amount of seconds a user has to wait before sending another message (0-21600) */
    rateLimitPerUser: nullish(
      pipe(number(), integer(), minValue(0), maxValue(21600))
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
  Channel
> = async ({ channel, message, body }) =>
  post(`/channels/${channel}/messages/${message}/threads`, body);

export const startThreadFromMessageSafe = toValidated(
  startThreadFromMessage,
  startThreadFromMessageSchema,
  channelSchema
);

export const startThreadFromMessageProcedure = toProcedure(
  `mutation`,
  startThreadFromMessage,
  startThreadFromMessageSchema,
  channelSchema
);
