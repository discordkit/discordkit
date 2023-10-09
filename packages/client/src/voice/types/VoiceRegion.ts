// https://discord.com/developers/docs/resources/voice#voice-region-object-voice-region-structure

import { object, string, boolean, type Output } from "valibot";

export const voiceRegionSchema = object({
  /** unique ID for the region */
  id: string(),
  /** name of the region */
  name: string(),
  /** true for a single server that is closest to the current user's client */
  optimal: boolean(),
  /** whether this is a deprecated voice region (avoid switching to these) */
  deprecated: boolean(),
  /** whether this is a custom voice region (used for events/etc) */
  custom: boolean()
});

export type VoiceRegion = Output<typeof voiceRegionSchema>;
