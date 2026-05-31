import * as v from "valibot";
import {
  boundedArray,
  boundedInteger,
  boundedString,
  partialSchema,
  schema
} from "@discordkit/core";
import { allowedMentionSchema } from "../../messages/types/AllowedMention.js";
import { embedSchema } from "../../messages/types/Embed.js";
import { messageComponentSchema } from "../../messages/types/MessageComponent.js";
import { attachmentSchema } from "../../messages/types/Attachment.js";
import { pollCreateRequestSchema } from "../../poll/types/PollCreateRequest.js";
import { applicationCommandOptionChoiceSchema } from "../../application-commands/types/ApplicationCommandOptionChoice.js";
import { componentSchema } from "../../components/types/Component.js";

const _messagesCallbackDataSchema = v.object({
  /** is the response TTS */
  tts: v.exactOptional(v.boolean()),
  /** message content */
  content: v.exactOptional(boundedString()),
  /** supports up to 10 embeds */
  embeds: v.exactOptional(boundedArray(embedSchema, { max: 10 })),
  /** allowed mentions object */
  allowedMentions: v.exactOptional(allowedMentionSchema),
  /** message flags combined as a bitfield (only SUPPRESS_EMBEDS and EPHEMERAL can be set) */
  flags: v.exactOptional(boundedInteger()),
  /** message components */
  components: v.exactOptional(messageComponentSchema),
  /** attachment objects with filename and description */
  attachments: v.exactOptional(v.array(partialSchema(attachmentSchema))),
  /** Details about the poll */
  poll: v.exactOptional(pollCreateRequestSchema)
});

export interface MessagesCallbackData extends v.InferOutput<
  typeof _messagesCallbackDataSchema
> {}

/**
 * Data payload for the `CHANNEL_MESSAGE_WITH_SOURCE` and
 * `UPDATE_MESSAGE` callback types — describes the message body to
 * send or replace with.
 */
export const messagesCallbackDataSchema = schema<MessagesCallbackData>(
  _messagesCallbackDataSchema
);

const _autocompleteCallbackDataSchema = v.object({
  /** autocomplete choices (max of 25 choices) */
  choices: boundedArray(applicationCommandOptionChoiceSchema, { max: 25 })
});

export interface AutocompleteCallbackData extends v.InferOutput<
  typeof _autocompleteCallbackDataSchema
> {}

/**
 * Data payload for the `APPLICATION_COMMAND_AUTOCOMPLETE_RESULT`
 * callback type — the suggested choices to present to the user.
 */
export const autocompleteCallbackDataSchema = schema<AutocompleteCallbackData>(
  _autocompleteCallbackDataSchema
);

const _modalCallbackDataSchema = v.object({
  /** Developer-defined identifier for the modal, max 100 characters */
  customId: boundedString({ max: 100 }),
  /** Title of the popup modal, max 45 characters */
  title: boundedString({ max: 45 }),
  /** Between 1 and 5 (inclusive) components that make up the modal */
  components: boundedArray(componentSchema, { max: 5 })
});

export interface ModalCallbackData extends v.InferOutput<
  typeof _modalCallbackDataSchema
> {}

/**
 * Data payload for the `MODAL` callback type — the modal to display.
 */
export const modalCallbackDataSchema = schema<ModalCallbackData>(
  _modalCallbackDataSchema
);

export type InteractionCallbackData =
  | MessagesCallbackData
  | AutocompleteCallbackData
  | ModalCallbackData;

/**
 * Union of the three possible shapes of the `data` field on an
 * {@link InteractionCallbackRequest}. The actual shape is determined
 * by the parent request's `type` discriminator; prefer
 * {@link InteractionCallbackRequest} for new code.
 */
export const interactionCallbackDataSchema = v.union([
  _messagesCallbackDataSchema,
  _autocompleteCallbackDataSchema,
  _modalCallbackDataSchema
]) as v.GenericSchema<InteractionCallbackData>;
