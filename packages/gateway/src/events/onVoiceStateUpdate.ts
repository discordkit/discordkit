import type { VoiceState } from "@discordkit/client/voice/types/VoiceState";
import { dispatchEvent } from "./dispatch.js";

/**
 * ### [Voice State Update](https://discord.com/developers/docs/events/gateway-events#voice-state-update)
 *
 * Sent when someone joins/leaves/moves voice channels. Inner payload is a
 * voice state object.
 *
 * Gated by `GUILD_VOICE_STATES`.
 */
export const onVoiceStateUpdate = dispatchEvent<
  VoiceState,
  `VOICE_STATE_UPDATE`
>(`VOICE_STATE_UPDATE`);
