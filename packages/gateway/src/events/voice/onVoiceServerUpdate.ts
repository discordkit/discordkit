import { dispatchEvent } from "../dispatch.js";
import type { VoiceServerUpdate } from "./types/VoiceEvents.js";

/**
 * ### [Voice Server Update](https://discord.com/developers/docs/events/gateway-events#voice-server-update)
 *
 * Sent when a guild's voice server is updated. A null endpoint means reallocation is in progress — wait for the next event.
 *
 * Never gated by an intent — it answers a Voice State Update you sent.
 */
export const onVoiceServerUpdate = dispatchEvent<
  VoiceServerUpdate,
  `VOICE_SERVER_UPDATE`
>(`VOICE_SERVER_UPDATE`);
