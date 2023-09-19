import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { voiceRegionSchema, type VoiceRegion } from "./types";

/**
 * Returns an array of voice region objects that can be used when setting a voice or stage channel's [`rtc_region`](https://discord.com/developers/docs/resources/channel#channel-object-channel-structure).
 *
 * https://discord.com/developers/docs/resources/voice#list-voice-regions
 */
export const listVoiceRegions: Fetcher<
  z.ZodUnknown,
  VoiceRegion[]
> = async () => get(`/voice/regions`);

export const listVoiceRegionsProcedure = createProcedure(
  `query`,
  listVoiceRegions,
  z.unknown(),
  voiceRegionSchema.array()
);
