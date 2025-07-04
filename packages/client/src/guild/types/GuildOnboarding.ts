import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { onboardingPromptSchema } from "./OnboardingPrompt.js";
import { onboardingModeSchema } from "./OnboardingMode.js";

export const guildOnboardingSchema = v.object({
  /** ID of the guild this onboarding is part of */
  guildId: snowflake,
  /** Prompts shown during onboarding and in customize community */
  prompts: v.array(onboardingPromptSchema),
  /** Channel IDs that members get opted into automatically */
  defaultChannelIds: v.array(snowflake),
  /** Whether onboarding is enabled in the guild */
  enabled: v.boolean(),
  /** Current mode of onboarding */
  mode: onboardingModeSchema
});

export interface GuildOnboarding
  extends v.InferOutput<typeof guildOnboardingSchema> {}
