import {
  object,
  array,
  boolean,
  type InferOutput,
  type GenericSchema
} from "valibot";
import { snowflake } from "@discordkit/core";
import { onboardingPromptSchema } from "./OnboardingPrompt.js";
import { onboardingModeSchema } from "./OnboardingMode.js";

export const guildOnboardingSchema = object({
  /** ID of the guild this onboarding is part of */
  guildId: snowflake as GenericSchema<string>,
  /** Prompts shown during onboarding and in customize community */
  prompts: array(onboardingPromptSchema),
  /** Channel IDs that members get opted into automatically */
  defaultChannelIds: array(snowflake) as GenericSchema<string[]>,
  /** Whether onboarding is enabled in the guild */
  enabled: boolean(),
  /** Current mode of onboarding */
  mode: onboardingModeSchema
});

export interface GuildOnboarding
  extends InferOutput<typeof guildOnboardingSchema> {}
