import * as v from "valibot";
import {
  remove,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteOriginalInteractionResponseSchema = v.object({
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
 * ### [Delete Original Interaction Response](https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response)
 *
 * **DELETE** `/webhooks/:application/:token/messages/@original`
 *
 * Deletes the initial Interaction response. Returns `204 No Content` on success.
 */
export const deleteOriginalInteractionResponse: Fetcher<
  typeof deleteOriginalInteractionResponseSchema
> = async ({ application, token, params }) =>
  remove(
    buildURL(`/webhooks/${application}/${token}/messages/@original}`, params)
      .href
  );

export const deleteOriginalInteractionResponseSafe = toValidated(
  deleteOriginalInteractionResponse,
  deleteOriginalInteractionResponseSchema
);

export const deleteOriginalInteractionResponseProcedure = toProcedure(
  `mutation`,
  deleteOriginalInteractionResponse,
  deleteOriginalInteractionResponseSchema
);
