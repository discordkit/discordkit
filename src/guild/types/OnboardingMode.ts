import { z } from "zod";

export enum OnboardingMode {
  /** Counts only Default Channels towards constraints */
  ONBOARDING_DEFAULT = 0,
  /** Counts Default Channels and Questions towards constraints */
  ONBOARDING_ADVANCED = 1
}

export const onboardingModeSchema = z.nativeEnum(OnboardingMode);
