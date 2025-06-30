import {
  boolean,
  exactOptional,
  nonEmpty,
  object,
  partial,
  pipe,
  string,
  undefinedable
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import type { InteractionCallbackResponse } from "./types/InteractionCallbackResponse.js";
import { interactionCallbackResponseSchema } from "./types/InteractionCallbackResponse.js";

export const createInteractionResponseSchema = object({
  interaction: snowflake,
  token: pipe(string(), nonEmpty()),
  body: interactionCallbackResponseSchema,
  params: exactOptional(
    partial(
      object({
        /** Whether to include an interaction callback object as the response */
        withResponse: boolean()
      })
    )
  )
});

/**
 * ### [Create Interaction Response](https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response)
 *
 * **POST** `/interactions/:interaction/:token/callback`
 *
 * Create a response to an Interaction. Body is an interaction response. Returns `204` unless `withResponse` is set to `true` which returns `200` with the body as interaction callback response.
 *
 * This endpoint also supports file attachments similar to the webhook endpoints. Refer to Uploading Files for details on uploading files and `multipart/form-data` requests.
 */
export const createInteractionResponse: Fetcher<
  typeof createInteractionResponseSchema,
  InteractionCallbackResponse | undefined
> = async ({ interaction, token, body }) =>
  post(`/interactions/${interaction}/${token}/callback`, body);

export const createInteractionResponseSafe = toValidated(
  createInteractionResponse,
  createInteractionResponseSchema,
  undefinedable(interactionCallbackResponseSchema)
);

export const createInteractionResponseProcedure = toProcedure(
  `mutation`,
  createInteractionResponse,
  createInteractionResponseSchema,
  undefinedable(interactionCallbackResponseSchema)
);
