import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { stagePrivacyLevelSchema } from "./StagePrivacyLevel.ts";

export const stageSchema = z.object({
  /** The id of this Stage instance */
  id: snowflake,
  /** The guild id of the associated Stage channel */
  guildId: snowflake,
  /** The id of the associated Stage channel */
  channelId: snowflake,
  /** The topic of the Stage instance (1-120 characters) */
  topic: z.string(),
  /** The privacy level of the Stage instance */
  privacyLevel: stagePrivacyLevelSchema,
  /** @deprecated Whether or not Stage Discovery is disabled */
  discoverableDisabled: z.boolean(),
  /** The id of the scheduled event for this Stage instance */
  guildScheduledEventId: snowflake.optional()
});

export type Stage = z.infer<typeof stageSchema>;
