import * as v from "valibot";

export enum PromptType {
  MULTIPLE_CHOICE = 0,
  DROPDOWN = 1
}

export const promptTypeSchema = v.enum_(PromptType);
