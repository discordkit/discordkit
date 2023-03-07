import { z } from "zod";
import { KeywordPreset } from "./KeywordPreset";

export const triggerMeta = z.object({
  /** KEYWORD	substrings which will be searched for in content */
  keywordFilter: z.array(z.string().min(1)),
  /** KEYWORD_PRESET	the internally pre-defined wordsets which will be searched for in content */
  presets: z.array(z.nativeEnum(KeywordPreset))
});

export type TriggerMeta = z.infer<typeof triggerMeta>;
