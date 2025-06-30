import { enum_ } from "valibot";

export enum ModerationTriggerType {
  /** check if content contains words from a user defined list of keywords */
  KEYWORD = 1,
  /** check if content represents generic spam */
  SPAM = 3,
  /** check if content contains words from internal pre-defined wordsets */
  KEYWORD_PRESET = 4,
  /** check if content contains more unique mentions than allowed */
  MENTION_SPAM = 5,
  /** check if member profile contains words from a user defined list of keywords */
  MEMBER_PROFILE = 6
}

export const moderationTriggerTypeSchema = enum_(ModerationTriggerType);
