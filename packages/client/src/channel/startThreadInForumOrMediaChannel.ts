import { z } from "zod";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { type Channel, channelSchema } from "./types/Channel.ts";
import { autoArchiveDurationSchema } from "./types/AutoArchiveDuration.ts";
import { embedSchema } from "./types/Embed.ts";
import { allowedMentionSchema } from "./types/AllowedMention.ts";
import { attachmentSchema } from "./types/Attachment.ts";
import { messageComponentSchema } from "./types/MessageComponent.ts";
import { type Message, messageSchema } from "./types/Message.ts";

export const startThreadInForumOrMediaChannelSchema = z.object({
  channel: snowflake,
  body: z.object({
    /** 1-100 character channel name */
    name: z.string().min(1).max(100),
    /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
    autoArchiveDuration: autoArchiveDurationSchema.nullable(),
    /** amount of seconds a user has to wait before sending another message (0-21600) */
    rateLimitPerUser: z.number().int().min(0).max(21600).nullable().optional(),
    /** contents of the first message in the forum thread */
    message: z
      .object({
        /** Message contents (up to 2000 characters) */
        content: z.string().min(1).max(2000).nullable(),
        /** Embedded rich content (up to 6000 characters) */
        embeds: embedSchema.array().nullable(),
        /** Allowed mentions for the message */
        allowedMentions: allowedMentionSchema.nullable(),
        /** Components to include with the message */
        components: messageComponentSchema.nullable(),
        /** IDs of up to 3 stickers in the server to send in the message */
        stickerIds: z.string().array().max(3).nullable(),
        /** Contents of the file being sent. See Uploading Files */
        files: z.unknown().optional(),
        /** Attachment objects with filename and description. See Uploading Files */
        attachments: attachmentSchema.partial().array().nullable(),
        /** Message flags combined as a bitfield (only SUPPRESS_EMBEDS can be set) */
        flags: z.number().int().nullable()
      })
      .partial(),
    /** the IDs of the set of tags that have been applied to a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel */
    appliedTags: snowflake.array().nullable()
  })
});

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
 * > **WARNING**
 * >
 * > Discord may strip certain characters from message content, like invalid unicode characters or characters which cause unexpected message formatting. If you are passing user-generated strings into message content, consider sanitizing the data to prevent unexpected behavior and using `allowed_mentions` to prevent unexpected mentions.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const startThreadInForumOrMediaChannel: Fetcher<
  typeof startThreadInForumOrMediaChannelSchema,
  Channel & { message: Message }
> = async ({ channel, body }) => post(`/channels/${channel}/threads`, body);

export const startThreadInForumOrMediaChannelSafe = toValidated(
  startThreadInForumOrMediaChannel,
  startThreadInForumOrMediaChannelSchema,
  channelSchema.extend({ message: messageSchema })
);

export const startThreadInForumOrMediaChannelProcedure = toProcedure(
  `mutation`,
  startThreadInForumOrMediaChannel,
  startThreadInForumOrMediaChannelSchema,
  channelSchema.extend({ message: messageSchema })
);
