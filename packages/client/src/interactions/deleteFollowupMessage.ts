import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteFollowupMessageSchema = v.object({
  application: snowflake,
  token: v.pipe(v.string(), v.nonEmpty()),
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
  typeof deleteFollowupMessageSchema,
  void,
  { anonymous: true }
> = async ({ application, token, message }, options) =>
  remove(`/webhooks/${application}/${token}/messages/${message}`, options);
