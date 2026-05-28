import * as v from "valibot";
import { get, type Fetcher, snowflake, boundedString } from "@discordkit/core";
import { type InteractionCallbackResponse } from "./types/InteractionCallbackResponse.js";

export const getOriginalInteractionResponseSchema = v.object({
  application: snowflake,
  token: boundedString(),
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
  InteractionCallbackResponse,
  { anonymous: true }
> = async ({ application, token, params }, options) =>
  get(`/webhooks/${application}/${token}/messages/@original`, params, options);
