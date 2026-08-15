import type { Channel } from "@discordkit/client/channel/types/Channel";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Channel Create](https://discord.com/developers/docs/events/gateway-events#channel-create)
 *
 * Sent when a new guild channel is created, relevant to the current user.
 * The inner payload is a channel object.
 *
 * Gated by `GUILDS`.
 */
export const onChannelCreate = dispatchEvent<Channel, `CHANNEL_CREATE`>(
  `CHANNEL_CREATE`
);
