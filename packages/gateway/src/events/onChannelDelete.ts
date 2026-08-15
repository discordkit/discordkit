import type { Channel } from "@discordkit/client/channel/types/Channel";
import { dispatchEvent } from "./dispatch.js";

/**
 * ### [Channel Delete](https://discord.com/developers/docs/events/gateway-events#channel-delete)
 *
 * Sent when a channel relevant to the current user is deleted. The inner
 * payload is a channel object.
 *
 * Gated by `GUILDS`.
 */
export const onChannelDelete = dispatchEvent<Channel, `CHANNEL_DELETE`>(
  `CHANNEL_DELETE`
);
