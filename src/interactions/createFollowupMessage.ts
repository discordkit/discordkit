import { z } from "zod";
import { post, buildURL, type Fetcher, toProcedure } from "../utils";
import { messageFlagSchema } from "../channel/types/MessageFlag";
import { embedSchema } from "../channel/types/Embed";
import { allowedMentionSchema } from "../channel/types/AllowedMention";
import { attachmentSchema } from "../channel/types/Attachment";
import { EmbedType } from "../channel/types/EmbedType";
import { messageComponentSchema } from "../channel/types/MessageComponent";

export const createFollowupMessageSchema = z.object({
  application: z.string().min(1),
  token: z.string().min(1),
  params: z
    .object({
      /** waits for server confirmation of message send before response, and returns the created message body (defaults to false; when false a message that is not saved does not return an error) */
      wait: z.boolean().default(false),
      /** Send a message to the specified thread within a webhook's channel. The thread will automatically be unarchived. */
      threadId: z.string().min(1)
    })
    .partial()
    .optional(),
  body: z
    .object({
      /** the message contents (up to 2000 characters) */
      content: z.string().min(1).max(2000),
      /** override the default username of the webhook */
      username: z.string().min(1),
      /** override the default avatar of the webhook */
      avatarUrl: z.string().min(1),
      /** true if this is a TTS message */
      tts: z.boolean(),
      /** embedded rich content */
      embeds: embedSchema
        .extend({ type: z.literal(EmbedType.RICH) })
        .array()
        .max(10),
      /** allowed mentions for the message */
      allowedMentions: allowedMentionSchema,
      /** the components to include with the message */
      components: messageComponentSchema.array(),
      /** the contents of the file being sent */
      files: z.unknown().array(),
      /** attachment objects with filename and description */
      attachments: attachmentSchema.partial().array(),
      /** message flags combined as a bitfield (only SUPPRESS_EMBEDS can be set) */
      flags: messageFlagSchema,
      /** name of thread to create (requires the webhook channel to be a forum channel) */
      threadName: z.string().min(1)
    })
    .partial()
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

export const createFollowupMessageProcedure = toProcedure(
  `mutation`,
  createFollowupMessage,
  createFollowupMessageSchema
);
