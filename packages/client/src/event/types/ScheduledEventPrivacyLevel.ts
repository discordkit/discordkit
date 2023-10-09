import { nativeEnum } from "valibot";

export enum ScheduledEventPrivacyLevel {
  /** the scheduled event is only accessible to guild members */
  GUILD_ONLY = 2
}

export const scheduledEventPrivacyLevelSchema = nativeEnum(
  ScheduledEventPrivacyLevel
);
