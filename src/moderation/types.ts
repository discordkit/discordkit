import { z } from "zod";

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

export enum ModerationEvent {
  /** when a member sends or edits a message in the guild */
  MESSAGE_SEND = 1
}

export enum ModerationTrigger {
  /** check if content contains words from a user defined list of keywords */
  KEYWORD = 1,
  /** check if content contains any harmful links */
  HARMFUL_LINK = 2,
  /** check if content represents generic spam */
  SPAM = 3,
  /** check if content contains words from internal pre-defined wordsets */
  KEYWORD_PRESET = 4
}

export enum KeywordPreset {
  /** Words that may be considered forms of swearing or cursing */
  PROFANITY = 1,
  /** Words that refer to sexually explicit behavior or activity */
  SEXUAL_CONTENT = 2,
  /** Personal insults or words that may be considered hate speech */
  SLURS = 3
}

export const triggerMeta = z.object({
  /** KEYWORD	substrings which will be searched for in content */
  keywordFilter: z.array(z.string().min(1)),
  /** KEYWORD_PRESET	the internally pre-defined wordsets which will be searched for in content */
  presets: z.array(z.nativeEnum(KeywordPreset))
});

export type TriggerMeta = z.infer<typeof triggerMeta>;

export enum ModerationActionType {
  /** blocks the content of a message according to the rule */
  BLOCK_MESSAGE = 1,
  /** logs user content to a specified channel */
  SEND_ALERT_MESSAGE = 2,
  /**timeout user for a specified duration */
  TIMEOUT = 3
}

export const moderationActionMeta = z.union([
  z.object({
    /** channel to which user content should be logged */
    channelId: z.string().min(1).optional()
  }),
  z.object({
    /** timeout duration in seconds */
    durationSeconds: z.number().positive()
  })
]);

export type ModerationActionMeta = z.infer<typeof moderationActionMeta>;

export const moderationAction = z.object({
  /** the type of action */
  type: z.nativeEnum(ModerationActionType),
  /** action metadata	additional metadata needed during execution for this specific action type */
  metadata: moderationActionMeta.optional()
});

export type ModerationAction = z.infer<typeof moderationAction>;
