import { z } from "zod";
import { keywordPresetSchema } from "./KeywordPreset";

export const triggerMetaSchema = z.object({
  /** KEYWORD	substrings which will be searched for in content (Maximum of 1000) */
  keywordFilter: z.string().array().max(1000),
  /** KEYWORD	regular expression patterns which will be matched against content (Maximum of 10) */
  regexPatterns: z.string().array().max(10),
  /** KEYWORD_PRESET	the internally pre-defined wordsets which will be searched for in content */
  presets: keywordPresetSchema.array(),
  /** KEYWORD, KEYWORD_PRESET	substrings which should not trigger the rule (Maximum of 100 or 1000) */
  allowList: z.string().array().max(1000),
  /** MENTION_SPAM	total number of unique role and user mentions allowed per message (Maximum of 50) */
  mentionTotalLimit: z.number().int().max(50),
  /** MENTION_SPAM	whether to automatically detect mention raids */
  mentionRaidProtectionEnabled: z.boolean()
});

export type TriggerMeta = z.infer<typeof triggerMetaSchema>;
