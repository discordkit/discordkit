import { z } from "zod";
import { moderationActionSchema } from "./ModerationAction";
import { moderationEventSchema } from "./ModerationEvent";
import { moderationTriggerTypeSchema } from "./ModerationTriggerType";
import { triggerMetaSchema } from "./TriggerMeta";

export const moderationRuleSchema = z.object({
  /** the id of this rule */
  id: z.string().min(1),
  /** the guild which this rule belongs to */
  guildId: z.string().min(1),
  /** the rule name */
  name: z.string().min(1),
  /** the user which first created this rule */
  creatorId: z.string().min(1),
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
  exemptRoles: z.string().min(1).array(),
  /** the channel ids that should not be affected by the rule (Maximum of 50) */
  exemptChannels: z.string().min(1).array()
});

export type ModerationRule = z.infer<typeof moderationRuleSchema>;
