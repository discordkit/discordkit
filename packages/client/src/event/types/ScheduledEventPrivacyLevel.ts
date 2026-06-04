import * as v from "valibot";

/**
 * ### [Scheduled Event Privacy Level](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level)
 */
export enum ScheduledEventPrivacyLevel {
  /** the scheduled event is only accessible to guild members */
  GUILD_ONLY = 2
}

export const scheduledEventPrivacyLevelSchema = v.enum_(
  ScheduledEventPrivacyLevel
);
