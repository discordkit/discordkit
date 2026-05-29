import * as v from "valibot";
import { post, type Fetcher, snowflake } from "@discordkit/core";
import { type Message } from "./types/Message.js";

export const crosspostMessageSchema = v.object({
  channel: snowflake,
  message: snowflake
});

/**
 * ### [Crosspost Message](https://discord.com/developers/docs/resources/message#crosspost-message)
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
