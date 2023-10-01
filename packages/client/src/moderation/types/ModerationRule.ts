import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { moderationActionSchema } from "./ModerationAction.ts";
import { moderationEventSchema } from "./ModerationEvent.ts";
import { moderationTriggerTypeSchema } from "./ModerationTriggerType.ts";
import { triggerMetaSchema } from "./TriggerMeta.ts";

export const moderationRuleSchema = z.object({
  /** the id of this rule */
  id: snowflake,
  /** the guild which this rule belongs to */
  guildId: snowflake,
  /** the rule name */
  name: z.string().min(1),
  /** the user which first created this rule */
  creatorId: snowflake,
  /** the rule event type */
  eventType: moderationEventSchema,
  /** the rule trigger type */
  triggerType: moderationTriggerTypeSchema,
  /** the rule trigger metadata */
  triggerMetadata: triggerMetaSchema,
  /** the actions which will execute when the rule is triggered */
  actions: moderationActionSchema.array(),
  /** whether the rule is enabled */
  enabled: z.boolean(),
  /** the role ids that should not be affected by the rule (Maximum of 20) */
  exemptRoles: snowflake.array().max(20),
  /** the channel ids that should not be affected by the rule (Maximum of 50) */
  exemptChannels: snowflake.array().max(50)
});

export type ModerationRule = z.infer<typeof moderationRuleSchema>;
