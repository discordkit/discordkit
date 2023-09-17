import { z } from "zod";

export enum ScheduledEventPrivacyLevel {
  /** the scheduled event is only accessible to guild members */
  GUILD_ONLY = 2
}

export const scheduledEventPrivacyLevel = z.nativeEnum(
  ScheduledEventPrivacyLevel
);
