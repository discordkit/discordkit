import * as v from "valibot";
import { keywordPresetSchema } from "./KeywordPreset.js";

export const triggerMetaSchema = v.object({
  /** KEYWORD	substrings which will be searched for in content (Maximum of 1000) */
  keywordFilter: v.pipe(
    v.array(v.string()),
    v.maxLength(1000)
  ) as v.GenericSchema<string[]>,
  /** KEYWORD	regular expression patterns which will be matched against content (Maximum of 10) */
  regexPatterns: v.pipe(
    v.array(v.string()),
    v.maxLength(10)
  ) as v.GenericSchema<string[]>,
  /** KEYWORD_PRESET	the internally pre-defined wordsets which will be searched for in content */
  presets: v.array(keywordPresetSchema),
  /** KEYWORD, KEYWORD_PRESET	substrings which should not trigger the rule (Maximum of 100 or 1000) */
  allowList: v.pipe(v.array(v.string()), v.maxLength(1000)) as v.GenericSchema<
    string[]
  >,
  /** MENTION_SPAM	total number of unique role and user mentions allowed per message (Maximum of 50) */
  mentionTotalLimit: v.pipe(
    v.number(),
    v.integer(),
    v.maxValue(50)
  ) as v.GenericSchema<number>,
  /** MENTION_SPAM	whether to automatically detect mention raids */
  mentionRaidProtectionEnabled: v.boolean()
});

export interface TriggerMeta extends v.InferOutput<typeof triggerMetaSchema> {}
