import * as v from "valibot";

/**
 * ### [Scheduled Event Status](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status)
 */
export enum ScheduledEventStatus {
  SCHEDULED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELED = 4
}

export const scheduledEventStatusSchema = v.enum_(ScheduledEventStatus);
