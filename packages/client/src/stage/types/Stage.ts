import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { stagePrivacyLevelSchema } from "./StagePrivacyLevel.js";

export const stageSchema = v.object({
  /** The id of this Stage instance */
  id: snowflake,
  /** The guild id of the associated Stage channel */
  guildId: snowflake,
  /** The id of the associated Stage channel */
  channelId: snowflake,
  /** The topic of the Stage instance (1-120 characters) */
  topic: v.pipe(v.string(), v.nonEmpty()),
  /** The privacy level of the Stage instance */
  privacyLevel: stagePrivacyLevelSchema,
  /** @deprecated Whether or not Stage Discovery is disabled */
  discoverableDisabled: v.boolean(),
  /** The id of the scheduled event for this Stage instance */
  guildScheduledEventId: v.nullable(snowflake)
});

export interface Stage extends v.InferOutput<typeof stageSchema> {}
