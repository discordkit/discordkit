import type { GenericSchema, InferOutput } from "valibot";
import {
  array,
  exactOptional,
  integer,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  partial,
  pipe,
  string,
  unknown
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asInteger
} from "@discordkit/core";
import { threadChannelSchema } from "./types/Channel.js";
import { autoArchiveDurationSchema } from "./types/AutoArchiveDuration.js";
import { embedSchema } from "../messages/types/Embed.js";
import { allowedMentionSchema } from "../messages/types/AllowedMention.js";
import { attachmentSchema } from "../messages/types/Attachment.js";
import { messageComponentSchema } from "../messages/types/MessageComponent.js";
import { messageSchema } from "../messages/types/Message.js";
import { messageFlag } from "../messages/index.js";

export const startThreadInForumOrMediaChannelSchema = object({
  channel: snowflake,
  body: object({
    /** 1-100 character channel name */
    name: pipe(string(), minLength(1), maxLength(100)),
    /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
    autoArchiveDuration: exactOptional(autoArchiveDurationSchema),
    /** amount of seconds a user has to wait before sending another message (0-21600) */
    rateLimitPerUser: exactOptional(
      pipe(number(), integer(), minValue(0), maxValue(21600))
    ),
    /** contents of the first message in the forum thread */
    message: partial(
      object({
        /** Message contents (up to 2000 characters) */
        content: pipe(string(), minLength(1), maxLength(2000)),
        /** Embedded rich content (up to 6000 characters) */
        embeds: array(embedSchema),
        /** Allowed mentions for the message */
        allowedMentions: allowedMentionSchema,
        /** Components to include with the message */
        components: messageComponentSchema,
        /** IDs of up to 3 stickers in the server to send in the message */
        stickerIds: pipe(array(string()), maxLength(3)),
        /** Attachment objects with filename and description. See Uploading Files */
        attachments: array(partial(attachmentSchema)),
        /** Message flags combined as a bitfield (only `SUPPRESS_EMBEDS` and `SUPPRESS_NOTIFICATIONS` can be set) */
        flags: asInteger(messageFlag) as GenericSchema<number>
      })
    ),
    /** the IDs of the set of tags that have been applied to a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
    appliedTags: exactOptional(array(snowflake)),
    /** 	Contents of the file being sent. See Uploading Files */
    files: exactOptional(unknown()),
    /** JSON-encoded body of non-file params, only for `multipart/form-data` requests. See Uploading Files */
    payloadJson: exactOptional(unknown())
  })
});

export const threadInForumOrMediaChannelResponseSchema = object({
  ...threadChannelSchema.entries,
  message: messageSchema
});

export type ThreadInForumOrMediaChannelResponse = InferOutput<
  typeof threadInForumOrMediaChannelResponseSchema
>;

/**
 * ### [Start Thread in Forum or Media Channel](https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel)
 *
 * **POST** `/channels/:channel/threads`
 *
 * Creates a new thread in a forum or a media channel, and sends a message within the created thread. Returns a {@link Channel | channel}, with a nested message object, on success, and a `400 BAD REQUEST` on invalid parameters. Fires a Thread Create and Message Create Gateway event.
 *
 * - The type of the created thread is `PUBLIC_THREAD`.
 * - See message formatting for more information on how to properly format messages.
 * - The current user must have the `SEND_MESSAGES` permission (`CREATE_PUBLIC_THREADS` is ignored).
 * - The maximum request size when sending a message is **25 MiB**.
 * - For the embed object, you can set every field except `type` (it will be rich regardless of if you try to set it), `provider`, `video`, and any `height`, `width`, or `proxyUrl` values for images.
 * - Examples for file uploads are available in Uploading Files.
 * - Files must be attached using a `multipart/form-data` body as described in Uploading Files.
 * - Note that when sending a message, you must provide a value for at least one of `content`, `embeds`, `stickerIds`, `components`, or `files`.
 *
 * > [!WARNING]
 * >
 * > Discord may strip certain characters from message content, like invalid unicode characters or characters which cause unexpected message formatting. If you are passing user-generated strings into message content, consider sanitizing the data to prevent unexpected behavior and using `allowed_mentions` to prevent unexpected mentions.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const startThreadInForumOrMediaChannel: Fetcher<
  typeof startThreadInForumOrMediaChannelSchema,
  ThreadInForumOrMediaChannelResponse
> = async ({ channel, body }) => post(`/channels/${channel}/threads`, body);

export const startThreadInForumOrMediaChannelSafe = toValidated(
  startThreadInForumOrMediaChannel,
  startThreadInForumOrMediaChannelSchema,
  threadInForumOrMediaChannelResponseSchema
);

export const startThreadInForumOrMediaChannelProcedure = toProcedure(
  `mutation`,
  startThreadInForumOrMediaChannel,
  startThreadInForumOrMediaChannelSchema,
  threadInForumOrMediaChannelResponseSchema
);
