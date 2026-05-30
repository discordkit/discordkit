import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { onboardingPromptSchema } from "./OnboardingPrompt.js";
import { onboardingModeSchema } from "./OnboardingMode.js";

/**
 * ### [Guild Onboarding](https://discord.com/developers/docs/resources/guild#guild-onboarding-object)
 *
 * Represents the [onboarding](https://support.discord.com/hc/en-us/articles/11074987197975-Community-Onboarding-FAQ) flow for a guild.
 */
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

export interface GuildOnboarding extends v.InferOutput<
  typeof guildOnboardingSchema
> {}
