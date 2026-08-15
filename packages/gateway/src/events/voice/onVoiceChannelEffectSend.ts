import { dispatchEvent } from "../dispatch.js";
import type { VoiceChannelEffectSend } from "./types/VoiceEvents.js";

/**
 * ### [Voice Channel Effect Send](https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send)
 *
 * Sent when someone sends an effect — an emoji reaction or soundboard sound — in a voice channel.
 *
 * Gated by `GUILD_VOICE_STATES`.
 */
export const onVoiceChannelEffectSend = dispatchEvent<
  VoiceChannelEffectSend,
  `VOICE_CHANNEL_EFFECT_SEND`
>(`VOICE_CHANNEL_EFFECT_SEND`);
