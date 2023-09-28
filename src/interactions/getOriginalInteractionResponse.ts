import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import {
  type InteractionResponse,
  interactionResponseSchema
} from "./types/InteractionResponse.ts";

export const getOriginalInteractionResponseSchema = z.object({
  application: z.string().min(1),
  token: z.string().min(1),
  params: z
    .object({
      /** id of the thread the message is in */
      threadId: z.string().min(1)
    })
    .partial()
    .optional()
});

/**
 * ### [Get Original Interaction Response](https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response)
 *
 * **GET** `/webhooks/:application/:token/messages/@original`
 *
 * Returns the initial {@link InteractionReponse Interaction response}. Functions the same as Get Webhook Message.
 */
export const getOriginalInteractionResponse: Fetcher<
  typeof getOriginalInteractionResponseSchema,
  InteractionResponse
> = async ({ application, token, params }) =>
  get(`/webhooks/${application}/${token}/messages/@original`, params);

export const getOriginalInteractionResponseProcedure = toProcedure(
  `query`,
  getOriginalInteractionResponse,
  getOriginalInteractionResponseSchema,
  interactionResponseSchema
);

export const getOriginalInteractionResponseQuery = toQuery(
  getOriginalInteractionResponse
);
