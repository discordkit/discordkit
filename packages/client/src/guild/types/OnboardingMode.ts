import * as v from "valibot";

export enum OnboardingMode {
  /** Counts only Default Channels towards constraints */
  ONBOARDING_DEFAULT = 0,
  /** Counts Default Channels and Questions towards constraints */
  ONBOARDING_ADVANCED = 1
}

export const onboardingModeSchema = v.enum_(OnboardingMode);
