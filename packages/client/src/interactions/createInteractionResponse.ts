import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { variantSchema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { InteractionCallbackResponse } from "./types/InteractionCallbackResponse.js";
import { InteractionCallbackType } from "./types/InteractionCallbackType.js";
import {
  messagesCallbackDataSchema,
  autocompleteCallbackDataSchema,
  modalCallbackDataSchema
} from "./types/InteractionCallbackData.js";

const _pongRequestSchema = v.object({
  /** ACK a Ping */
  type: v.literal(InteractionCallbackType.PONG)
});

interface PongCallbackRequest extends v.InferOutput<
  typeof _pongRequestSchema
> {}

const _channelMessageWithSourceRequestSchema = v.object({
  /** Respond to an interaction with a message */
  type: v.literal(InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE),
  /** the message data to send */
  data: messagesCallbackDataSchema
});

interface ChannelMessageWithSourceCallbackRequest extends v.InferOutput<
  typeof _channelMessageWithSourceRequestSchema
> {}

const _deferredChannelMessageWithSourceRequestSchema = v.object({
  /** ACK an interaction and edit a response later, user sees a loading state */
  type: v.literal(InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE),
  /** optional message flags (only EPHEMERAL may be set) */
  data: v.exactOptional(
    v.object({
      flags: v.exactOptional(v.number())
    })
  )
});

interface DeferredChannelMessageWithSourceCallbackRequest extends v.InferOutput<
  typeof _deferredChannelMessageWithSourceRequestSchema
> {}

const _deferredUpdateMessageRequestSchema = v.object({
  /** For components, ACK an interaction and edit the original message later */
  type: v.literal(InteractionCallbackType.DEFERRED_UPDATE_MESSAGE)
});

interface DeferredUpdateMessageCallbackRequest extends v.InferOutput<
  typeof _deferredUpdateMessageRequestSchema
> {}

const _updateMessageRequestSchema = v.object({
  /** For components, edit the message the component was attached to */
  type: v.literal(InteractionCallbackType.UPDATE_MESSAGE),
  /** the new message data to replace the original message with */
  data: messagesCallbackDataSchema
});

interface UpdateMessageCallbackRequest extends v.InferOutput<
  typeof _updateMessageRequestSchema
> {}

const _autocompleteResultRequestSchema = v.object({
  /** Respond to an autocomplete interaction with suggested choices */
  type: v.literal(
    InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT
  ),
  /** the autocomplete suggestions */
  data: autocompleteCallbackDataSchema
});

interface AutocompleteResultCallbackRequest extends v.InferOutput<
  typeof _autocompleteResultRequestSchema
> {}

const _modalRequestSchema = v.object({
  /** Respond to an interaction with a popup modal */
  type: v.literal(InteractionCallbackType.MODAL),
  /** the modal definition */
  data: modalCallbackDataSchema
});

interface ModalCallbackRequest extends v.InferOutput<
  typeof _modalRequestSchema
> {}

const _launchActivityRequestSchema = v.object({
  /** Launch the Activity associated with the app (apps with Activities enabled only) */
  type: v.literal(InteractionCallbackType.LAUNCH_ACTIVITY)
});

interface LaunchActivityCallbackRequest extends v.InferOutput<
  typeof _launchActivityRequestSchema
> {}

type InteractionCallbackRequest =
  | PongCallbackRequest
  | ChannelMessageWithSourceCallbackRequest
  | DeferredChannelMessageWithSourceCallbackRequest
  | DeferredUpdateMessageCallbackRequest
  | UpdateMessageCallbackRequest
  | AutocompleteResultCallbackRequest
  | ModalCallbackRequest
  | LaunchActivityCallbackRequest;

/**
 * Request body for `POST /interactions/:interaction/:token/callback`.
 * Discord calls this the "Interaction Response Object" in their docs,
 * but it's the body of a *request* (the response is
 * {@link InteractionCallbackResponse}). Discriminated by `type`; each
 * variant carries the `data` shape Discord requires for that callback
 * kind.
 *
 * @see https://docs.discord.com/developers/interactions/receiving-and-responding#interaction-response-object
 */
const interactionCallbackRequestSchema =
  variantSchema<InteractionCallbackRequest>(`type`, [
    _pongRequestSchema,
    _channelMessageWithSourceRequestSchema,
    _deferredChannelMessageWithSourceRequestSchema,
    _deferredUpdateMessageRequestSchema,
    _updateMessageRequestSchema,
    _autocompleteResultRequestSchema,
    _modalRequestSchema,
    _launchActivityRequestSchema
  ]);

export const createInteractionResponseSchema = v.object({
  interaction: snowflake,
  token: v.pipe(v.string(), v.nonEmpty()),
  body: interactionCallbackRequestSchema,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** Whether to include an interaction callback object as the response */
        withResponse: v.boolean()
      })
    )
  )
});

/**
 * ### [Create Interaction Response](https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response)
 *
 * **POST** `/interactions/:interaction/:token/callback`
 *
 * Create a response to an Interaction. Body is an {@link InteractionCallbackResponse | interaction response}. Returns `204` unless `withResponse` is set to `true` which returns `200` with the body as interaction callback response.
 *
 * This endpoint also supports file attachments similar to the webhook endpoints. Refer to Uploading Files for details on uploading files and `multipart/form-data` requests.
 */
export const createInteractionResponse: Fetcher<
  typeof createInteractionResponseSchema,
  InteractionCallbackResponse | undefined,
  { anonymous: true }
> = async ({ interaction, token, body }, options) =>
  post(`/interactions/${interaction}/${token}/callback`, body, options);
