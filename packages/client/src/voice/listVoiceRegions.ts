import type { Fetcher } from "@discordkit/core";
import { get } from "@discordkit/core/requests/methods";
import type { VoiceRegion } from "./types/VoiceRegion.js";

/**
 * ### [List Voice Regions](https://discord.com/developers/docs/resources/voice#list-voice-regions)
 *
 * **GET** `/voice/regions`
 *
 * Returns an array of {@link VoiceRegion | voice region objects} that can be used when setting a voice or stage channel's `rtc_region`.
 */
export const listVoiceRegions: Fetcher<null, VoiceRegion[]> = async () =>
  get(`/voice/regions`);
