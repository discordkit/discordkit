import { nonEmpty, object, pipe, string } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteFollowupMessageSchema = object({
  application: snowflake,
  token: pipe(string(), nonEmpty()),
  message: snowflake
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
> = async ({ application, token, message }) =>
  remove(`/webhooks/${application}/${token}/messages/${message}`);

export const deleteFollowupMessageSafe = toValidated(
  deleteFollowupMessage,
  deleteFollowupMessageSchema
);

export const deleteFollowupMessageProcedure = toProcedure(
  `mutation`,
  deleteFollowupMessage,
  deleteFollowupMessageSchema
);
