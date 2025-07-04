import * as v from "valibot";
import { boundedArray, boundedInteger } from "@discordkit/core";
import { keywordPresetSchema } from "./KeywordPreset.js";

export const triggerMetaSchema = v.object({
  /** KEYWORD	substrings which will be searched for in content (Maximum of 1000) */
  keywordFilter: boundedArray(v.string(), { max: 1000 }),
  /** KEYWORD	regular expression patterns which will be matched against content (Maximum of 10) */
  regexPatterns: boundedArray(v.string(), { max: 10 }),
  /** KEYWORD_PRESET	the internally pre-defined wordsets which will be searched for in content */
  presets: v.array(keywordPresetSchema),
  /** KEYWORD, KEYWORD_PRESET	substrings which should not trigger the rule (Maximum of 100 or 1000) */
  allowList: boundedArray(v.string(), { max: 1000 }),
  /** MENTION_SPAM	total number of unique role and user mentions allowed per message (Maximum of 50) */
  mentionTotalLimit: boundedInteger({ max: 50 }),
  /** MENTION_SPAM	whether to automatically detect mention raids */
  mentionRaidProtectionEnabled: v.boolean()
});

export interface TriggerMeta extends v.InferOutput<typeof triggerMetaSchema> {}
