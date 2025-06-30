import {
  array,
  boolean,
  literal,
  maxLength,
  nonEmpty,
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
import { embedSchema } from "../messages/types/Embed.js";
import { allowedMentionSchema } from "../messages/types/AllowedMention.js";
import { attachmentSchema } from "../messages/types/Attachment.js";
import { EmbedType } from "../messages/types/EmbedType.js";
import { messageComponentSchema } from "../messages/types/MessageComponent.js";
import { messageFlag } from "../messages/types/MessageFlag.js";

export const createFollowupMessageSchema = object({
  application: snowflake,
  token: pipe(string(), nonEmpty()),
  body: partial(
    object({
      /** the message contents (up to 2000 characters) */
      content: pipe(string(), nonEmpty(), maxLength(2000)),
      /** true if this is a TTS message */
      tts: boolean(),
      /** embedded rich content */
      embeds: pipe(
        array(
          object({
            ...embedSchema.entries,
            type: literal(EmbedType.RICH)
          })
        ),
        maxLength(10)
      ),
      /** allowed mentions for the message */
      allowedMentions: allowedMentionSchema,
      /** the components to include with the message */
      components: array(messageComponentSchema),
      /** the contents of the file being sent */
      files: array(unknown()),
      /** attachment objects with filename and description */
      attachments: array(partial(attachmentSchema)),
      /** message flags combined as a bitfield */
      flags: asInteger(messageFlag),
      /** name of thread to create (requires the webhook channel to be a forum channel) */
      threadName: pipe(string(), nonEmpty())
    })
  )
});

/**
 * ### [Create Followup Message](https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message)
 *
 * **POST** `/webhooks/:application/:token`
 *
 * > [!NOTE]
 * >
 * > Apps are limited to 5 followup messages per interaction if it was initiated from a user-installed app and isn't installed in the server (meaning the authorizing integration owners object only contains `USER_INSTALL`)
 *
 * Create a followup message for an Interaction. Functions the same as Execute Webhook, but wait is always true. The `threadId`, `avatarUrl`, and `username` parameters are not supported when using this endpoint for interaction followups. You can use the `EPHEMERAL` message flag `1 << 6` (64) to send a message that only the user can see. You can also use the `IS_COMPONENTS_V2` message flag `1 << 15` (32768) to send a component-based message.
 *
 * When using this endpoint directly after responding to an interaction with `DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE`, this endpoint will function as Edit Original Interaction Response for backwards compatibility. In this case, no new message will be created, and the loading message will be edited instead. The ephemeral flag will be ignored, and the value you provided in the initial defer response will be preserved, as an existing message's ephemeral state cannot be changed. This behavior is deprecated, and you should use the Edit Original Interaction Response endpoint in this case instead.
 */
export const createFollowupMessage: Fetcher<
  typeof createFollowupMessageSchema
> = async ({ application, token, body }) =>
  post(`/webhooks/${application}/${token}`, body);

export const createFollowupMessageSafe = toValidated(
  createFollowupMessage,
  createFollowupMessageSchema
);

export const createFollowupMessageProcedure = toProcedure(
  `mutation`,
  createFollowupMessage,
  createFollowupMessageSchema
);
