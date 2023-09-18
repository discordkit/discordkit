import type { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { VoiceRegion } from "./types";

/**
 * Returns an array of voice region objects that can be used when setting a voice or stage channel's [`rtc_region`](https://discord.com/developers/docs/resources/channel#channel-object-channel-structure).
 *
 * https://discord.com/developers/docs/resources/voice#list-voice-regions
 */
export const listVoiceRegions: Fetcher<
  z.ZodUnknown,
  VoiceRegion[]
> = async () => get(`/voice/regions`);
