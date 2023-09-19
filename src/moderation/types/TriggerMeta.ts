import { z } from "zod";
import { keywordPresetSchema } from "./KeywordPreset";

export const triggerMetaSchema = z.object({
  /** KEYWORD	substrings which will be searched for in content */
  keywordFilter: z.string().min(1).array(),
  /** KEYWORD_PRESET	the internally pre-defined wordsets which will be searched for in content */
  presets: keywordPresetSchema.array()
});

export type TriggerMeta = z.infer<typeof triggerMetaSchema>;
