import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type InteractionCallbackResponse,
  interactionCallbackResponseSchema
} from "./types/InteractionCallbackResponse.js";

export const getOriginalInteractionResponseSchema = v.object({
  application: snowflake,
  token: v.pipe(v.string(), v.nonEmpty()),
  params: v.exactOptional(
    v.partial(
      v.object({
        /** id of the thread the message is in */
        threadId: snowflake
      })
    )
  )
});

/**
 * ### [Get Original Interaction Response](https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response)
 *
 * **GET** `/webhooks/:application/:token/messages/@original`
 *
 * Returns the initial {@link InteractionCallbackResponse Interaction response}. Functions the same as Get Webhook Message.
 */
export const getOriginalInteractionResponse: Fetcher<
  typeof getOriginalInteractionResponseSchema,
  InteractionCallbackResponse
> = async ({ application, token, params }) =>
  get(`/webhooks/${application}/${token}/messages/@original`, params);

export const getOriginalInteractionResponseSafe = toValidated(
  getOriginalInteractionResponse,
  getOriginalInteractionResponseSchema,
  interactionCallbackResponseSchema
);

export const getOriginalInteractionResponseProcedure = toProcedure(
  `query`,
  getOriginalInteractionResponse,
  getOriginalInteractionResponseSchema,
  interactionCallbackResponseSchema
);

export const getOriginalInteractionResponseQuery = toQuery(
  getOriginalInteractionResponse
);
