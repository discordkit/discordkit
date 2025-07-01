import * as v from "valibot";

export enum ScheduledEventPrivacyLevel {
  /** the scheduled event is only accessible to guild members */
  GUILD_ONLY = 2
}

export const scheduledEventPrivacyLevelSchema = v.enum_(
  ScheduledEventPrivacyLevel
);
