import { z } from "zod";
import { stagePrivacyLevel } from "./StagePrivacyLevel";

export const stage = z.object({
  /** The id of this Stage instance */
  id: z.string(),
  /** The guild id of the associated Stage channel */
  guildId: z.string(),
  /** The id of the associated Stage channel */
  channelId: z.string(),
  /** The topic of the Stage instance (1-120 characters) */
  topic: z.string(),
  /** The privacy level of the Stage instance */
  privacyLevel: stagePrivacyLevel,
  /** @deprecated Whether or not Stage Discovery is disabled */
  discoverableDisabled: z.boolean()
});

export type Stage = z.infer<typeof stage>;
