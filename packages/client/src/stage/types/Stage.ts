import { object, string, boolean, optional, type Output } from "valibot";
import { snowflake } from "@discordkit/core";
import { stagePrivacyLevelSchema } from "./StagePrivacyLevel.js";

export const stageSchema = object({
  /** The id of this Stage instance */
  id: snowflake,
  /** The guild id of the associated Stage channel */
  guildId: snowflake,
  /** The id of the associated Stage channel */
  channelId: snowflake,
  /** The topic of the Stage instance (1-120 characters) */
  topic: string(),
  /** The privacy level of the Stage instance */
  privacyLevel: stagePrivacyLevelSchema,
  /** @deprecated Whether or not Stage Discovery is disabled */
  discoverableDisabled: boolean(),
  /** The id of the scheduled event for this Stage instance */
  guildScheduledEventId: optional(snowflake)
});

export type Stage = Output<typeof stageSchema>;
