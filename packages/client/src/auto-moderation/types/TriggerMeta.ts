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
  pipe,
  type GenericSchema
} from "valibot";
import { keywordPresetSchema } from "./KeywordPreset.js";

export const triggerMetaSchema = object({
  /** KEYWORD	substrings which will be searched for in content (Maximum of 1000) */
  keywordFilter: pipe(array(string()), maxLength(1000)) as GenericSchema<
    string[]
  >,
  /** KEYWORD	regular expression patterns which will be matched against content (Maximum of 10) */
  regexPatterns: pipe(array(string()), maxLength(10)) as GenericSchema<
    string[]
  >,
  /** KEYWORD_PRESET	the internally pre-defined wordsets which will be searched for in content */
  presets: array(keywordPresetSchema),
  /** KEYWORD, KEYWORD_PRESET	substrings which should not trigger the rule (Maximum of 100 or 1000) */
  allowList: pipe(array(string()), maxLength(1000)) as GenericSchema<string[]>,
  /** MENTION_SPAM	total number of unique role and user mentions allowed per message (Maximum of 50) */
  mentionTotalLimit: pipe(
    number(),
    integer(),
    maxValue(50)
  ) as GenericSchema<number>,
  /** MENTION_SPAM	whether to automatically detect mention raids */
  mentionRaidProtectionEnabled: boolean()
});

export interface TriggerMeta extends InferOutput<typeof triggerMetaSchema> {}
