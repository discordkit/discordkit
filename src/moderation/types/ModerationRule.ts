import type { ModerationAction } from "./ModerationAction";
import type { ModerationEvent } from "./ModerationEvent";
import type { ModerationTrigger } from "./ModerationTrigger";
import type { TriggerMeta } from "./TriggerMeta";

export interface ModerationRule {
  /** the id of this rule */
  id: string;
  /** the guild which this rule belongs to */
  guildId: string;
  /** the rule name */
  name: string;
  /** the user which first created this rule */
  creatorId: string;
  /** the rule event type */
  eventType: ModerationEvent;
  /** the rule trigger type */
  triggerType: ModerationTrigger;
  /** the rule trigger metadata */
  triggerMetadata: TriggerMeta;
  /** the actions which will execute when the rule is triggered */
  actions: ModerationAction[];
  /** whether the rule is enabled */
  enabled: boolean;
  /** the role ids that should not be affected by the rule (Maximum of 20) */
  exemptRoles: string[];
  /** the channel ids that should not be affected by the rule (Maximum of 50) */
  exemptChannels: string[];
}
