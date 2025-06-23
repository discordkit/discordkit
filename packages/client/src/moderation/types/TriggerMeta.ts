import {
  maxLength,
  object,
  string,
  array,
  number,
  integer,
  maxValue,
  boolean,
  type InferOutput,
  pipe
} from "valibot";
import { keywordPresetSchema } from "./KeywordPreset.js";

export const triggerMetaSchema = object({
  /** KEYWORD	substrings which will be searched for in content (Maximum of 1000) */
  keywordFilter: pipe(array(string()), maxLength(1000)),
  /** KEYWORD	regular expression patterns which will be matched against content (Maximum of 10) */
  regexPatterns: pipe(array(string()), maxLength(10)),
  /** KEYWORD_PRESET	the internally pre-defined wordsets which will be searched for in content */
  presets: array(keywordPresetSchema),
  /** KEYWORD, KEYWORD_PRESET	substrings which should not trigger the rule (Maximum of 100 or 1000) */
  allowList: pipe(array(string()), maxLength(1000)),
  /** MENTION_SPAM	total number of unique role and user mentions allowed per message (Maximum of 50) */
  mentionTotalLimit: pipe(number(), integer(), maxValue(50)),
  /** MENTION_SPAM	whether to automatically detect mention raids */
  mentionRaidProtectionEnabled: boolean()
});

export type TriggerMeta = InferOutput<typeof triggerMetaSchema>;
