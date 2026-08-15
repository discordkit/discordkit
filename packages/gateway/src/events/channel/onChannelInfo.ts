import { dispatchEvent } from "../dispatch.js";
import type { ChannelInfo } from "./types/ChannelEvents.js";

/**
 * ### [Channel Info](https://discord.com/developers/docs/events/gateway-events#channel-info)
 *
 * Ephemeral channel data, sent in response to a Request Channel Info send-event.
 *
 * Never gated by an intent — it answers your own request.
 */
export const onChannelInfo = dispatchEvent<ChannelInfo, `CHANNEL_INFO`>(
  `CHANNEL_INFO`
);
