import {
  type InferOutput,
  object,
  string,
  array,
  boolean,
  maxLength,
  pipe,
  nonEmpty,
  type GenericSchema
} from "valibot";
import { snowflake } from "@discordkit/core";
import { moderationActionSchema } from "./ModerationAction.js";
import { moderationEventSchema } from "./ModerationEvent.js";
import { moderationTriggerTypeSchema } from "./ModerationTriggerType.js";
import { triggerMetaSchema } from "./TriggerMeta.js";

export const moderationRuleSchema = object({
  /** the id of this rule */
  id: snowflake as GenericSchema<string>,
  /** the guild which this rule belongs to */
  guildId: snowflake as GenericSchema<string>,
  /** the rule name */
  name: pipe(string(), nonEmpty()) as GenericSchema<string>,
  /** the user which first created this rule */
  creatorId: snowflake as GenericSchema<string>,
  /** the rule event type */
  eventType: moderationEventSchema,
  /** the rule trigger type */
  triggerType: moderationTriggerTypeSchema,
  /** the rule trigger metadata */
  triggerMetadata: triggerMetaSchema,
  /** the actions which will execute when the rule is triggered */
  actions: array(moderationActionSchema),
  /** whether the rule is enabled */
  enabled: boolean(),
  /** the role ids that should not be affected by the rule (Maximum of 20) */
  exemptRoles: pipe(array(snowflake), maxLength(20)) as GenericSchema<string[]>,
  /** the channel ids that should not be affected by the rule (Maximum of 50) */
  exemptChannels: pipe(array(snowflake), maxLength(50)) as GenericSchema<
    string[]
  >
});

export interface ModerationRule
  extends InferOutput<typeof moderationRuleSchema> {}
