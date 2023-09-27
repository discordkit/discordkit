import { z } from "zod";
import { stagePrivacyLevelSchema } from "./StagePrivacyLevel";

export const stageSchema = z.object({
  /** The id of this Stage instance */
  id: z.string().min(1),
  /** The guild id of the associated Stage channel */
  guildId: z.string().min(1),
  /** The id of the associated Stage channel */
  channelId: z.string().min(1),
  /** The topic of the Stage instance (1-120 characters) */
  topic: z.string(),
  /** The privacy level of the Stage instance */
  privacyLevel: stagePrivacyLevelSchema,
  /** @deprecated Whether or not Stage Discovery is disabled */
  discoverableDisabled: z.boolean(),
  /** The id of the scheduled event for this Stage instance */
  guildScheduledEventId: z.string().min(1).optional()
});

export type Stage = z.infer<typeof stageSchema>;
