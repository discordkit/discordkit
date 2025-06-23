import { object, array, boolean, type InferOutput } from "valibot";
import { snowflake } from "@discordkit/core";
import { onboardingPromptSchema } from "./OnboardingPrompt.js";
import { onboardingModeSchema } from "./OnboardingMode.js";

export const guildOnboardingSchema = object({
  /** ID of the guild this onboarding is part of */
  guildId: snowflake,
  /** Prompts shown during onboarding and in customize community */
  prompts: array(onboardingPromptSchema),
  /** Channel IDs that members get opted into automatically */
  defaultChannelIds: array(snowflake),
  /** Whether onboarding is enabled in the guild */
  enabled: boolean(),
  /** Current mode of onboarding */
  mode: onboardingModeSchema
});

export type GuildOnboarding = InferOutput<typeof guildOnboardingSchema>;
