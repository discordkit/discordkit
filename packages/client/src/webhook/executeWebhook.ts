import * as v from "valibot";
import {
  post,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asInteger
} from "@discordkit/core";
import { embedSchema } from "../messages/types/Embed.js";
import { allowedMentionSchema } from "../messages/types/AllowedMention.js";
import { attachmentSchema } from "../messages/types/Attachment.js";
import { EmbedType } from "../messages/types/EmbedType.js";
import { messageComponentSchema } from "../messages/types/MessageComponent.js";
import { messageFlag } from "../messages/types/MessageFlag.js";
import { pollSchema } from "../poll/types/Poll.js";

export const executeWebhookSchema = v.object({
  webhook: snowflake,
  token: v.pipe(v.string(), v.minLength(1)),
  params: v.exactOptional(
    v.partial(
      v.object({
        /** waits for server confirmation of message send before response, and returns the created message body (defaults to `false`; when `false` a message that is not saved does not return an error) */
        wait: v.exactOptional(v.boolean()),
        /** Send a message to the specified thread within a webhook's channel. The thread will automatically be unarchived. */
        threadId: snowflake,
        /** whether to respect the `components` field of the request. When enabled, allows application-owned webhooks to use all components and non-owned webhooks to use non-interactive components. (defaults to `false`) */
        withComponents: v.boolean()
      })
    )
  ),
  body: v.partial(
    v.object({
      /** the message contents (up to 2000 characters) */
      content: v.pipe(v.string(), v.minLength(1), v.maxLength(2000)),
      /** override the default username of the webhook */
      username: v.pipe(v.string(), v.minLength(1)),
      /** override the default avatar of the webhook */
      avatarUrl: v.pipe(v.string(), v.url()),
      /** true if this is a TTS message */
      tts: v.boolean(),
      /** embedded rich content */
      embeds: v.pipe(
        v.array(
          v.object({
            ...embedSchema.entries,
            type: v.literal(EmbedType.RICH)
          })
        ),
        v.maxLength(10)
      ),
      /** allowed mentions for the message */
      allowedMentions: allowedMentionSchema,
      /** the components to include with the message */
      components: v.array(messageComponentSchema),
      /** the contents of the file being sent */
      files: v.array(v.unknown()),
      /** JSON encoded body of non-file params */
      payloadJson: v.string(),
      /** attachment objects with filename and description */
      attachments: v.array(v.partial(attachmentSchema)),
      /** message flags combined as a bitfield (only SUPPRESS_EMBEDS can be set) */
      flags: asInteger(messageFlag) as v.GenericSchema<number>,
      /** name of thread to create (requires the webhook channel to be a forum channel) */
      threadName: v.pipe(v.string(), v.nonEmpty()),
      /** array of tag ids to apply to the thread (requires the webhook channel to be a forum or media channel) */
      appliedTags: v.array(snowflake),
      /** A poll! */
      poll: pollSchema
    })
  )
});

/**
 * ### [Execute Webhook](https://discord.com/developers/docs/resources/webhook#execute-webhook)
 *
 * **POST** `/webhooks/:webhook/:token`
 *
 * Refer to Uploading Files for details on attachments and `multipart/form-data` requests. Returns a message or `204 No Content` depending on the `wait` query parameter.
 *
 * > [!NOTE]
 * >
 * > Note that when sending a message, you must provide a value for at least one of `content`, `embeds`, `components`, or `file`.
 *
 * > [!NOTE]
 * >
 * > If the webhook channel is a forum channel, you must provide either `threadId` in the query string params, or `threadName` in the JSON/form params. If `threadId` is provided, the message will send in that thread. If `threadName` is provided, a thread with that name will be created in the forum channel.
 *
 * > [!WARNING]
 * >
 * > Discord may strip certain characters from message content, like invalid unicode characters or characters which cause unexpected message formatting. If you are passing user-generated strings into message content, consider sanitizing the data to prevent unexpected behavior and using `allowed_mentions` to prevent unexpected mentions.
 */
export const executeWebhook: Fetcher<typeof executeWebhookSchema> = async ({
  webhook,
  token,
  params,
  body
}) => post(buildURL(`/webhooks/${webhook}/${token}`, params).href, body);

export const executeWebhookSafe = toValidated(
  executeWebhook,
  executeWebhookSchema
);

export const executeWebhookProcedure = toProcedure(
  `mutation`,
  executeWebhook,
  executeWebhookSchema
);
