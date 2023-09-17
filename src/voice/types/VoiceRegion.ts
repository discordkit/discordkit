// https://discord.com/developers/docs/resources/voice#voice-region-object-voice-region-structure

import { z } from "zod";

export const voiceRegion = z.object({
  /** unique ID for the region */
  id: z.string(),
  /** name of the region */
  name: z.string(),
  /** true for a single server that is closest to the current user's client */
  optimal: z.boolean(),
  /** whether this is a deprecated voice region (avoid switching to these) */
  deprecated: z.boolean(),
  /** whether this is a custom voice region (used for events/etc) */
  custom: z.boolean()
});

export type VoiceRegion = z.infer<typeof voiceRegion>;
