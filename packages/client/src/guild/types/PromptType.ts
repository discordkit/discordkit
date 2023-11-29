import { enum_ } from "valibot";

export enum PromptType {
  MULTIPLE_CHOICE = 0,
  DROPDOWN = 1
}

export const promptTypeSchema = enum_(PromptType);
