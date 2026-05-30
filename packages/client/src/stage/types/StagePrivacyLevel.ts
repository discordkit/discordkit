import * as v from "valibot";

export const StagePrivacyLevel = {
  /** @deprecated The Stage instance is visible publicly. */
  PUBLIC: 1,
  /** The Stage instance is visible to only guild members. */
  GUILD_ONLY: 2
} as const;

/**
 * ### [Stage Privacy Level](https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level)
 */
export const stagePrivacyLevelSchema = v.enum_(StagePrivacyLevel);
