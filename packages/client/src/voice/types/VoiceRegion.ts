// https://discord.com/developers/docs/resources/voice#voice-region-object-voice-region-structure

import * as v from "valibot";

export const voiceRegionSchema = v.object({
  /** unique ID for the region */
  id: v.string(),
  /** name of the region */
  name: v.string(),
  /** true for a single server that is closest to the current user's client */
  optimal: v.boolean(),
  /** whether this is a deprecated voice region (avoid switching to these) */
  deprecated: v.boolean(),
  /** whether this is a custom voice region (used for events/etc) */
  custom: v.boolean()
});

export interface VoiceRegion extends v.InferOutput<typeof voiceRegionSchema> {}
