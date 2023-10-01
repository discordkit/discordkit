import { z } from "zod";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { interactionResponseSchema } from "./types/InteractionResponse.ts";

export const createInteractionResponseSchema = z.object({
  interaction: snowflake,
  token: z.string().min(1),
  body: interactionResponseSchema
});

/**
 * ### [Create Interaction Response](https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response)
 *
 * **POST** `/interactions/:interaction/:token/callback`
 *
 * Create a response to an Interaction from the gateway. Body is an interaction response. Returns `204 No Content`.
 *
 * This endpoint also supports file attachments similar to the webhook endpoints. Refer to Uploading Files for details on uploading files and `multipart/form-data` requests.
 */
export const createInteractionResponse: Fetcher<
  typeof createInteractionResponseSchema
> = async ({ interaction, token, body }) =>
  post(`/interactions/${interaction}/${token}/callback`, body);

export const createInteractionResponseSafe = toValidated(
  createInteractionResponse,
  createInteractionResponseSchema
);

export const createInteractionResponseProcedure = toProcedure(
  `mutation`,
  createInteractionResponse,
  createInteractionResponseSchema
);
