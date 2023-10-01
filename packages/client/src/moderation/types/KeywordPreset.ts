import { z } from "zod";

export enum KeywordPreset {
  /** Words that may be considered forms of swearing or cursing */
  PROFANITY = 1,
  /** Words that refer to sexually explicit behavior or activity */
  SEXUAL_CONTENT = 2,
  /** Personal insults or words that may be considered hate speech */
  SLURS = 3
}

export const keywordPresetSchema = z.nativeEnum(KeywordPreset);
