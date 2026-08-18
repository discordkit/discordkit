import type { Channel } from "@discordkit/client/channel/types/Channel";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Thread Create](https://discord.com/developers/docs/events/gateway-events#thread-create)
 *
 * Sent when a thread is created, relevant to the current user, or when the
 * current user is added to a thread. The inner payload is a channel object.
 *
 * Gated by `GUILDS`.
 */
export const onThreadCreate = dispatchEvent<Channel, `THREAD_CREATE`>(
  `THREAD_CREATE`,
  [`GUILDS`]
);
