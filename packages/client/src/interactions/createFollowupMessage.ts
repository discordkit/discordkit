import {
  array,
  boolean,
  integer,
  literal,
  maxLength,
  merge,
  minLength,
  number,
  object,
  optional,
  partial,
  string,
  unknown
} from "valibot";
import {
  post,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { embedSchema } from "../channel/types/Embed.js";
import { allowedMentionSchema } from "../channel/types/AllowedMention.js";
import { attachmentSchema } from "../channel/types/Attachment.js";
import { EmbedType } from "../channel/types/EmbedType.js";
import { messageComponentSchema } from "../channel/types/MessageComponent.js";

export const createFollowupMessageSchema = object({
  application: snowflake,
  token: string([minLength(1)]),
  params: optional(
    partial(
      object({
        /** waits for server confirmation of message send before response, and returns the created message body (defaults to false; when false a message that is not saved does not return an error) */
        wait: optional(boolean(), false),
        /** Send a message to the specified thread within a webhook's channel. The thread will automatically be unarchived. */
        threadId: snowflake
      })
    )
  ),
  body: partial(
    object({
      /** the message contents (up to 2000 characters) */
      content: string([minLength(1), maxLength(2000)]),
      /** override the default username of the webhook */
      username: string([minLength(1)]),
      /** override the default avatar of the webhook */
      avatarUrl: string([minLength(1)]),
      /** true if this is a TTS message */
      tts: boolean(),
      /** embedded rich content */
      embeds: array(
        merge([embedSchema, object({ type: literal(EmbedType.RICH) })]),
        [maxLength(10)]
      ),
      /** allowed mentions for the message */
      allowedMentions: allowedMentionSchema,
      /** the components to include with the message */
      components: array(messageComponentSchema),
      /** the contents of the file being sent */
      files: array(unknown()),
      /** attachment objects with filename and description */
      attachments: array(partial(attachmentSchema)),
      /** message flags combined as a bitfield (only SUPPRESS_EMBEDS can be set) */
      flags: number([integer()]),
      /** name of thread to create (requires the webhook channel to be a forum channel) */
      threadName: string([minLength(1)])
    })
  )
});

/**
 * ### [Create Followup Message](https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message)
 *
 * **POST** `/webhooks/:application/:token`
 *
 * Create a followup message for an Interaction. Functions the same as Execute Webhook, but `wait` is always true. The `threadId`, `avatarUrl`, and `username` parameters are not supported when using this endpoint for interaction followups.
 *
 * `flags` can be set to `64` to mark the message as ephemeral, except when it is the first followup message to a deferred Interactions Response. In that case, the `flags` field will be ignored, and the ephemerality of the message will be determined by the `flags` value in your original ACK.
 */
export const createFollowupMessage: Fetcher<
  typeof createFollowupMessageSchema
> = async ({ application, token, params, body }) =>
  post(buildURL(`/webhooks/${application}/${token}`, params).href, body);

export const createFollowupMessageSafe = toValidated(
  createFollowupMessage,
  createFollowupMessageSchema
);

export const createFollowupMessageProcedure = toProcedure(
  `mutation`,
  createFollowupMessage,
  createFollowupMessageSchema
);
