import { dispatchEvent } from "../dispatch.js";
import type { ChannelPinsUpdate } from "./types/ChannelEvents.js";

/**
 * ### [Channel Pins Update](https://discord.com/developers/docs/events/gateway-events#channel-pins-update)
 *
 * Sent when a message is pinned or unpinned — not when a pinned message is deleted.
 *
 * Gated by `GUILDS` or `DIRECT_MESSAGES`.
 */
export const onChannelPinsUpdate = dispatchEvent<
  ChannelPinsUpdate,
  `CHANNEL_PINS_UPDATE`
>(`CHANNEL_PINS_UPDATE`);
