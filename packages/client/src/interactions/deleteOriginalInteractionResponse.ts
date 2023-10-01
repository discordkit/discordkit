import { z } from "zod";
import {
  remove,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated
} from "@discordkit/core";

export const deleteOriginalInteractionResponseSchema = z.object({
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
