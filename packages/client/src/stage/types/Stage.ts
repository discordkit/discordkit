import {
  object,
  string,
  boolean,
  type InferOutput,
  nullable,
  nonEmpty,
  pipe
} from "valibot";
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
  topic: pipe(string(), nonEmpty()),
  /** The privacy level of the Stage instance */
  privacyLevel: stagePrivacyLevelSchema,
  /** @deprecated Whether or not Stage Discovery is disabled */
  discoverableDisabled: boolean(),
  /** The id of the scheduled event for this Stage instance */
  guildScheduledEventId: nullable(snowflake)
});

export type Stage = InferOutput<typeof stageSchema>;
