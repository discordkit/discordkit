import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { Message } from "../messages/types/Message.js";

export const getFollowupMessageSchema = v.object({
  application: snowflake,
  token: boundedString(),
  message: snowflake,
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
 * ### [Get Followup Message](https://discord.com/developers/docs/interactions/receiving-and-responding#get-followup-message)
 *
 * **GET** `/webhooks/:application/:token/messages/:message`
 *
 * Returns a followup message for an Interaction. Functions the same as Get Webhook Message.
 */
export const getFollowupMessage: Fetcher<
  typeof getFollowupMessageSchema,
  Message,
  { anonymous: true }
> = async ({ application, token, message, params }, options) =>
  get(`/webhooks/${application}/${token}/messages/${message}`, params, options);
