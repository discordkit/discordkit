import * as v from "valibot";

/**
 * ### [Onboarding Mode](https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-mode)
 */
export enum OnboardingMode {
  /** Counts only Default Channels towards constraints */
  ONBOARDING_DEFAULT = 0,
  /** Counts Default Channels and Questions towards constraints */
  ONBOARDING_ADVANCED = 1
}

export const onboardingModeSchema = v.enum_(OnboardingMode);
