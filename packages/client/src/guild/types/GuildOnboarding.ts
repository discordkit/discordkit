import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { onboardingPromptSchema } from "./OnboardingPrompt.js";
import { onboardingModeSchema } from "./OnboardingMode.js";

export const guildOnboardingSchema = z.object({
  /** ID of the guild this onboarding is part of */
  guildId: snowflake,
  /** Prompts shown during onboarding and in customize community */
  prompts: onboardingPromptSchema.array(),
  /** Channel IDs that members get opted into automatically */
  defaultChannelIds: snowflake.array(),
  /** Whether onboarding is enabled in the guild */
  enabled: z.boolean(),
  /** Current mode of onboarding */
  mode: onboardingModeSchema
});

export type GuildOnboarding = z.infer<typeof guildOnboardingSchema>;
