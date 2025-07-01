import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { promptOptionSchema } from "./PromptOption.js";
import { promptTypeSchema } from "./PromptType.js";

export const onboardingPromptSchema = v.object({
  /** ID of the prompt */
  id: snowflake,
  /** Type of prompt */
  type: promptTypeSchema,
  /** Options available within the prompt */
  options: v.array(promptOptionSchema),
  /** Title of the prompt */
  title: v.string(),
  /** Indicates whether users are limited to selecting one option for the prompt */
  singleSelect: v.boolean(),
  /** Indicates whether the prompt is required before a user completes the onboarding flow */
  required: v.boolean(),
  /** Indicates whether the prompt is present in the onboarding flow. If false, the prompt will only appear in the Channels & Roles tab */
  inOnboarding: v.boolean()
});

export interface OnboardingPrompt
  extends v.InferOutput<typeof onboardingPromptSchema> {}
