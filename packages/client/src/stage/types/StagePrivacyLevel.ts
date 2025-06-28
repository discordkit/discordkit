import { enum_ } from "valibot";

export const StagePrivacyLevel = {
  /** @deprecated The Stage instance is visible publicly. */
  PUBLIC: 1,
  /** The Stage instance is visible to only guild members. */
  GUILD_ONLY: 2
} as const;

export const stagePrivacyLevelSchema = enum_(StagePrivacyLevel);
