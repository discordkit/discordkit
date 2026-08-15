import { dispatchEvent } from "../dispatch.js";
import type { VoiceChannelStatusUpdate } from "./types/ChannelEvents.js";

/**
 * ### [Voice Channel Status Update](https://discord.com/developers/docs/events/gateway-events#voice-channel-status-update)
 *
 * Sent when a voice channel's status changes.
 *
 * Gated by `GUILDS`.
 */
export const onVoiceChannelStatusUpdate = dispatchEvent<
  VoiceChannelStatusUpdate,
  `VOICE_CHANNEL_STATUS_UPDATE`
>(`VOICE_CHANNEL_STATUS_UPDATE`, [`GUILDS`]);
