import { dispatchEvent } from "../dispatch.js";
import type { VoiceChannelStartTimeUpdate } from "./types/ChannelEvents.js";

/**
 * ### [Voice Channel Start Time Update](https://discord.com/developers/docs/events/gateway-events#voice-channel-start-time-update)
 *
 * Sent when a voice channel's session start time changes.
 *
 * Gated by `GUILDS`.
 */
export const onVoiceChannelStartTimeUpdate = dispatchEvent<
  VoiceChannelStartTimeUpdate,
  `VOICE_CHANNEL_START_TIME_UPDATE`
>(`VOICE_CHANNEL_START_TIME_UPDATE`);
