import { array, object, string, boolean, type InferOutput } from "valibot";
import { snowflake } from "@discordkit/core";
import { promptOptionSchema } from "./PromptOption.js";
import { promptTypeSchema } from "./PromptType.js";

export const onboardingPromptSchema = object({
  /** ID of the prompt */
  id: snowflake,
  /** Type of prompt */
  type: promptTypeSchema,
  /** Options available within the prompt */
  options: array(promptOptionSchema),
  /** Title of the prompt */
  title: string(),
  /** Indicates whether users are limited to selecting one option for the prompt */
  singleSelect: boolean(),
  /** Indicates whether the prompt is required before a user completes the onboarding flow */
  required: boolean(),
  /** Indicates whether the prompt is present in the onboarding flow. If false, the prompt will only appear in the Channels & Roles tab */
  inOnboarding: boolean()
});

export interface OnboardingPrompt
  extends InferOutput<typeof onboardingPromptSchema> {}
