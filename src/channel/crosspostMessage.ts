import { z } from "zod";
import { post, type Fetcher, createProcedure } from "../utils";
import { messageSchema, type Message } from "./types";

export const crosspostMessageSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1)
});

/**
 * Crosspost a message in a News Channel to following channels. This endpoint requires the `SEND_MESSAGES` permission, if the current user sent the message, or additionally the `MANAGE_MESSAGES` permission, for all other messages, to be present for the current user.
 *
 * https://discord.com/developers/docs/resources/channel#crosspost-message
 */
export const crosspostMessage: Fetcher<
  typeof crosspostMessageSchema,
  Message
> = async ({ channel, message }) =>
  post(`/channels/${channel}/messages/${message}/crosspost`);

export const crosspostMessageProcedure = createProcedure(
  `mutation`,
  crosspostMessage,
  crosspostMessageSchema,
  messageSchema
);
