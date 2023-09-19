import { z } from "zod";
import { moderationActionSchema } from "./ModerationAction";
import { moderationEventSchema } from "./ModerationEvent";
import { moderationTriggerSchema } from "./ModerationTrigger";
import { triggerMetaSchema } from "./TriggerMeta";

export const moderationRuleSchema = z.object({
  /** the id of this rule */
  id: z.string(),
  /** the guild which this rule belongs to */
  guildId: z.string(),
  /** the rule name */
  name: z.string(),
  /** the user which first created this rule */
  creatorId: z.string(),
  /** the rule event type */
  eventType: moderationEventSchema,
  /** the rule trigger type */
  triggerType: moderationTriggerSchema,
  /** the rule trigger metadata */
  triggerMetadata: triggerMetaSchema,
  /** the actions which will execute when the rule is triggered */
  actions: moderationActionSchema.array(),
  /** whether the rule is enabled */
  enabled: z.boolean(),
  /** the role ids that should not be affected by the rule (Maximum of 20) */
  exemptRoles: z.string().array(),
  /** the channel ids that should not be affected by the rule (Maximum of 50) */
  exemptChannels: z.string().array()
});

export type ModerationRule = z.infer<typeof moderationRuleSchema>;
