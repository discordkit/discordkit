import type { Channel } from "@discordkit/client/channel/types/Channel";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Channel Update](https://discord.com/developers/docs/events/gateway-events#channel-update)
 *
 * Sent when a channel is updated. The inner payload is a channel object.
 * This is not sent when the field `last_message_id` is altered. To keep
 * track of the last\_message\_id changes, you must listen for Message Create
 * events (or Thread Create events for `GUILD_FORUM` and `GUILD_MEDIA`
 * channels).
 *
 * Gated by `GUILDS`.
 */
export const onChannelUpdate = dispatchEvent<Channel, `CHANNEL_UPDATE`>(
  `CHANNEL_UPDATE`,
  [`GUILDS`]
);
