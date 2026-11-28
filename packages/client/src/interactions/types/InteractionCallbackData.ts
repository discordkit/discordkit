import * as v from "valibot";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { bitfield } from "@discordkit/core/validations/bitfield";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { allowedMentionSchema } from "../../messages/types/AllowedMention.js";
import { embedSchema } from "../../messages/types/Embed.js";
import { MessageFlag } from "../../messages/types/MessageFlag.js";
import { messageComponentSchema } from "../../messages/types/MessageComponent.js";
import { attachmentRequestSchema } from "../../messages/types/Attachment.js";
import { pollCreateRequestSchema } from "../../poll/types/PollCreateRequest.js";
import { applicationCommandOptionChoiceSchema } from "../../application-commands/types/ApplicationCommandOptionChoice.js";
import {
  type Component,
  componentSchema
} from "../../components/types/Component.js";
import { ComponentType } from "../../components/types/ComponentType.js";

/** The {@link MessageFlag | message flags} Discord allows on an interaction response's message. */
export const InteractionCallbackMessageFlags = {
  SUPPRESS_EMBEDS: MessageFlag.SUPPRESS_EMBEDS,
  EPHEMERAL: MessageFlag.EPHEMERAL,
  SUPPRESS_NOTIFICATIONS: MessageFlag.SUPPRESS_NOTIFICATIONS,
  IS_VOICE_MESSAGE: MessageFlag.IS_VOICE_MESSAGE,
  IS_COMPONENTS_V2: MessageFlag.IS_COMPONENTS_V2
} as const;

export const interactionCallbackMessageFlag = bitfield(
  `interactionCallbackMessageFlag`,
  InteractionCallbackMessageFlags,
  `Invalid message flags for an interaction response. Discord only allows SUPPRESS_EMBEDS, EPHEMERAL, IS_COMPONENTS_V2, IS_VOICE_MESSAGE and SUPPRESS_NOTIFICATIONS to be set when responding to an interaction. Remove any other flag from the bitfield.`
);

const _messagesCallbackDataSchema = v.object({
  /** is the response TTS */
  tts: v.exactOptional(v.boolean()),
  /** message content */
  content: v.exactOptional(boundedString()),
  /** supports up to 10 embeds */
  embeds: v.exactOptional(boundedArray(embedSchema, { max: 10 })),
  /** allowed mentions object */
  allowedMentions: v.exactOptional(allowedMentionSchema),
  /** message flags combined as a bitfield (only `SUPPRESS_EMBEDS`, `EPHEMERAL`, `IS_COMPONENTS_V2`, `IS_VOICE_MESSAGE`, and `SUPPRESS_NOTIFICATIONS` can be set) */
  flags: v.exactOptional(asInteger(interactionCallbackMessageFlag)),
  /** message components */
  components: v.exactOptional(messageComponentSchema),
  /** attachment objects with filename and description */
  attachments: v.exactOptional(v.array(attachmentRequestSchema)),
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

/** The most characters a modal's text display components may hold between them. */
const MAX_TEXT_DISPLAY_LENGTH = 4000;

/** The combined length of a modal's text displays. A modal holds text displays only at its top level, so there is no tree to walk. */
const textDisplayLength = (components: readonly Component[]): number =>
  components.reduce(
    (total, component) =>
      component.type === ComponentType.TextDisplay
        ? total + component.content.length
        : total,
    0
  );

const _modalCallbackDataSchema = v.object({
  /** Developer-defined identifier for the modal, max 100 characters */
  customId: boundedString({ max: 100 }),
  /** Title of the popup modal, max 45 characters */
  title: boundedString({ max: 45 }),
  /** Between 1 and 5 (inclusive) components that make up the modal. Its text displays may hold at most 4000 characters between them. */
  components: v.pipe(
    boundedArray(componentSchema, { max: 5 }),
    v.check(
      (components) => textDisplayLength(components) <= MAX_TEXT_DISPLAY_LENGTH,
      (issue) => {
        const length = textDisplayLength(issue.input);
        return `Expected at most ${MAX_TEXT_DISPLAY_LENGTH} characters across the modal's text display components, received: ${length} characters. Discord limits the combined length of every text display in a modal. Shorten the text by ${length - MAX_TEXT_DISPLAY_LENGTH} characters.`;
      }
    )
  ) as v.GenericSchema<Component[]>
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
