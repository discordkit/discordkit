import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Message } from "./types/Message.js";

export const getChannelMessageSchema = v.object({
  channel: snowflake,
  message: snowflake
});

/**
 * ### [Get Channel Message](https://discord.com/developers/docs/resources/message#get-channel-message)
 *
 * **GET** `/channels/:channel/messages/:message`
 *
 * Retrieves a specific message in the channel. Returns a {@link Message | message object} on success.
 *
 * If operating on a guild channel, this endpoint requires the current user to have the `VIEW_CHANNEL` and `READ_MESSAGE_HISTORY` permissions. If the channel is a voice channel, they must *also* have the `CONNECT` permission.
 */
export const getChannelMessage: Fetcher<
  typeof getChannelMessageSchema,
  Message
> = async ({ channel, message }) =>
  get(`/channels/${channel}/messages/${message}`);
