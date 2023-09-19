import { z } from "zod";

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

export const moderationTriggerSchema = z.nativeEnum(ModerationTrigger);
