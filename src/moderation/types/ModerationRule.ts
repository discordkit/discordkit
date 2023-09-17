import { z } from "zod";
import { moderationAction } from "./ModerationAction";
import { moderationEvent } from "./ModerationEvent";
import { moderationTrigger } from "./ModerationTrigger";
import { triggerMeta } from "./TriggerMeta";

export const moderationRule = z.object({
  /** the id of this rule */
  id: z.string(),
  /** the guild which this rule belongs to */
  guildId: z.string(),
  /** the rule name */
  name: z.string(),
  /** the user which first created this rule */
  creatorId: z.string(),
  /** the rule event type */
  eventType: moderationEvent,
  /** the rule trigger type */
  triggerType: moderationTrigger,
  /** the rule trigger metadata */
  triggerMetadata: triggerMeta,
  /** the actions which will execute when the rule is triggered */
  actions: moderationAction.array(),
  /** whether the rule is enabled */
  enabled: z.boolean(),
  /** the role ids that should not be affected by the rule (Maximum of 20) */
  exemptRoles: z.string().array(),
  /** the channel ids that should not be affected by the rule (Maximum of 50) */
  exemptChannels: z.string().array()
});

export type ModerationRule = z.infer<typeof moderationRule>;
