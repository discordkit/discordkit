import * as v from "valibot";

/**
 * ### [Prompt Type](https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-types)
 */
export enum PromptType {
  MULTIPLE_CHOICE = 0,
  DROPDOWN = 1
}

export const promptTypeSchema = v.enum_(PromptType);
