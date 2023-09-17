import { z } from "zod";

export enum StagePrivacyLevel {
  /** @deprecated The Stage instance is visible publicly. */
  PUBLIC = 1,
  /** The Stage instance is visible to only guild members. */
  GUILD_ONLY = 2
}

export const stagePrivacyLevel = z.nativeEnum(StagePrivacyLevel);
