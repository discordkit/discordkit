import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "@discordkit/core";
import { array } from "valibot";
import { voiceRegionSchema, type VoiceRegion } from "./types/VoiceRegion.js";

/**
 * ### [List Voice Regions](https://discord.com/developers/docs/resources/voice#list-voice-regions)
 *
 * **GET** `/voice/regions`
 *
 * Returns an array of {@link VoiceRegion | voice region objects} that can be used when setting a voice or stage channel's `rtcRegion`.
 */
export const listVoiceRegions: Fetcher<null, VoiceRegion[]> = async () =>
  get(`/voice/regions`);

export const listVoiceRegionsSafe = toValidated(
  listVoiceRegions,
  null,
  array(voiceRegionSchema)
);

export const listVoiceRegionsProcedure = toProcedure(
  `query`,
  listVoiceRegions,
  null,
  array(voiceRegionSchema)
);

export const listVoiceRegionsQuery = toQuery(listVoiceRegions);
