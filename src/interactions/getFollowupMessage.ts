import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "#/utils/index.ts";
import { messageSchema, type Message } from "#/channel/types/Message.ts";

export const getFollowupMessageSchema = z.object({
  application: z.string().min(1),
  token: z.string().min(1),
  message: z.string().min(1),
  params: z
    .object({
      /** id of the thread the message is in */
      threadId: z.string().min(1)
    })
    .partial()
    .optional()
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
