import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { promptOptionSchema } from "./PromptOption.js";
import { promptTypeSchema } from "./PromptType.js";

export const onboardingPromptSchema = z.object({
  /** ID of the prompt */
  id: snowflake,
  /** Type of prompt */
  type: promptTypeSchema,
  /** Options available within the prompt */
  options: promptOptionSchema.array(),
  /** Title of the prompt */
  title: z.string(),
  /** Indicates whether users are limited to selecting one option for the prompt */
  singleSelect: z.boolean(),
  /** Indicates whether the prompt is required before a user completes the onboarding flow */
  required: z.boolean(),
  /** Indicates whether the prompt is present in the onboarding flow. If false, the prompt will only appear in the Channels & Roles tab */
  inOnboarding: z.boolean()
});

export type OnboardingPrompt = z.infer<typeof onboardingPromptSchema>;
