import * as v from "valibot";
import { snowflake, boundedArray, boundedString } from "@discordkit/core";
import { moderationActionSchema } from "./ModerationAction.js";
import { moderationEventSchema } from "./ModerationEvent.js";
import { moderationTriggerTypeSchema } from "./ModerationTriggerType.js";
import { triggerMetaSchema } from "./TriggerMeta.js";

export const moderationRuleSchema = v.object({
  /** the id of this rule */
  id: snowflake,
  /** the guild which this rule belongs to */
  guildId: snowflake,
  /** the rule name */
  name: boundedString(),
  /** the user which first created this rule */
  creatorId: snowflake,
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
  exemptRoles: boundedArray(snowflake, { max: 20 }),
  /** the channel ids that should not be affected by the rule (Maximum of 50) */
  exemptChannels: boundedArray(snowflake, { max: 50 })
});

export interface ModerationRule
  extends v.InferOutput<typeof moderationRuleSchema> {}
