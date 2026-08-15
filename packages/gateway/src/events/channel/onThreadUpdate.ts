import type { Channel } from "@discordkit/client/channel/types/Channel";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Thread Update](https://discord.com/developers/docs/events/gateway-events#thread-update)
 *
 * Sent when a thread is updated. The inner payload is a channel object. This
 * is not sent when the field `last_message_id` is altered. To keep track of
 * the last\_message\_id changes, you must listen for Message Create events.
 *
 * Gated by `GUILDS`.
 */
export const onThreadUpdate = dispatchEvent<Channel, `THREAD_UPDATE`>(
  `THREAD_UPDATE`
);
