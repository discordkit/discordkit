import { z } from "zod";
import { onboardingPromptSchema } from "./OnboardingPrompt";
import { onboardingModeSchema } from "./OnboardingMode";

export const guildOnboardingSchema = z.object({
  /** ID of the guild this onboarding is part of */
  guildId: z.string().min(1),
  /** Prompts shown during onboarding and in customize community */
  prompts: onboardingPromptSchema.array(),
  /** Channel IDs that members get opted into automatically */
  defaultChannelIds: z.string().min(1).array(),
  /** Whether onboarding is enabled in the guild */
  enabled: z.boolean(),
  /** Current mode of onboarding */
  mode: onboardingModeSchema
});

export type GuildOnboarding = z.infer<typeof guildOnboardingSchema>;
