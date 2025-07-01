import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { moderationActionSchema } from "./ModerationAction.js";
import { moderationEventSchema } from "./ModerationEvent.js";
import { moderationTriggerTypeSchema } from "./ModerationTriggerType.js";
import { triggerMetaSchema } from "./TriggerMeta.js";

export const moderationRuleSchema = v.object({
  /** the id of this rule */
  id: snowflake as v.GenericSchema<string>,
  /** the guild which this rule belongs to */
  guildId: snowflake as v.GenericSchema<string>,
  /** the rule name */
  name: v.pipe(v.string(), v.nonEmpty()) as v.GenericSchema<string>,
  /** the user which first created this rule */
  creatorId: snowflake as v.GenericSchema<string>,
  /** the rule event type */
  eventType: moderationEventSchema,
  /** the rule trigger type */
  triggerType: moderationTriggerTypeSchema,
  /** the rule trigger metadata */
  triggerMetadata: triggerMetaSchema,
  /** the actions which will execute when the rule is triggered */
  actions: v.array(moderationActionSchema),
  /** whether the rule is enabled */
  enabled: v.boolean(),
  /** the role ids that should not be affected by the rule (Maximum of 20) */
  exemptRoles: v.pipe(v.array(snowflake), v.maxLength(20)) as v.GenericSchema<
    string[]
  >,
  /** the channel ids that should not be affected by the rule (Maximum of 50) */
  exemptChannels: v.pipe(
    v.array(snowflake),
    v.maxLength(50)
  ) as v.GenericSchema<string[]>
});

export interface ModerationRule
  extends v.InferOutput<typeof moderationRuleSchema> {}
