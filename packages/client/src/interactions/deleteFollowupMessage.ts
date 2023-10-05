import { z } from "zod";
import {
  remove,
  buildURL,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteFollowupMessageSchema = z.object({
  application: snowflake,
  token: z.string().min(1),
  message: snowflake,
  params: z
    .object({
      /** id of the thread the message is in */
      threadId: snowflake
    })
    .partial()
    .optional()
});

/**
 * ### [Delete Followup Message](https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message)
 *
 * **DELETE** `/webhooks/:application/:token/messages/:message`
 *
 * Deletes a followup message for an Interaction. Returns `204 No Content` on success.
 */
export const deleteFollowupMessage: Fetcher<
  typeof deleteFollowupMessageSchema
> = async ({ application, token, message, params }) =>
  remove(
    buildURL(`/webhooks/${application}/${token}/messages/${message}`, params)
      .href
  );

export const deleteFollowupMessageSafe = toValidated(
  deleteFollowupMessage,
  deleteFollowupMessageSchema
);

export const deleteFollowupMessageProcedure = toProcedure(
  `mutation`,
  deleteFollowupMessage,
  deleteFollowupMessageSchema
);
