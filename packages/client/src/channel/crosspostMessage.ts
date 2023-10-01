import { z } from "zod";
import { post, type Fetcher, toProcedure, toValidated } from "@discordkit/core";
import { messageSchema, type Message } from "./types/Message.ts";

export const crosspostMessageSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1)
});

/**
 * ### [Crosspost Message](https://discord.com/developers/docs/resources/channel#crosspost-message)
 *
 * **POST** `/channels/:channel/messages/:message/crosspost`
 *
 * Crosspost a message in an Announcement Channel to following channels. This endpoint requires the `SEND_MESSAGES` permission, if the current user sent the message, or additionally the `MANAGE_MESSAGES` permission, for all other messages, to be present for the current user.
 *
 * Returns a {@link Message | message object}. Fires a Message Update Gateway event.
 */
export const crosspostMessage: Fetcher<
  typeof crosspostMessageSchema,
  Message
> = async ({ channel, message }) =>
  post(`/channels/${channel}/messages/${message}/crosspost`);

export const crosspostMessageSafe = toValidated(
  crosspostMessage,
  crosspostMessageSchema,
  messageSchema
);

export const crosspostMessageProcedure = toProcedure(
  `mutation`,
  crosspostMessage,
  crosspostMessageSchema,
  messageSchema
);
