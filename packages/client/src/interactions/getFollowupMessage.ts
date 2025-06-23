import {
  nonEmpty,
  object,
  exactOptional,
  partial,
  pipe,
  string
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { messageSchema, type Message } from "../channel/types/Message.js";

export const getFollowupMessageSchema = object({
  application: snowflake,
  token: pipe(string(), nonEmpty()),
  message: snowflake,
  params: exactOptional(
    partial(
      object({
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
  Message
> = async ({ application, token, message, params }) =>
  get(`/webhooks/${application}/${token}/messages/${message}`, params);

export const getFollowupMessageSafe = toValidated(
  getFollowupMessage,
  getFollowupMessageSchema,
  messageSchema
);

export const getFollowupMessageProcedure = toProcedure(
  `query`,
  getFollowupMessage,
  getFollowupMessageSchema,
  messageSchema
);

export const getFollowupMessageQuery = toQuery(getFollowupMessage);
