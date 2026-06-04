import * as v from "valibot";

/**
 * ### [Scheduled Event Entity Type](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types)
 */
export enum ScheduledEventEntityType {
  STAGE_INSTANCE = 1,
  VOICE = 2,
  EXTERNAL = 3
}

export const scheduledEventEntityTypeSchema = v.enum_(ScheduledEventEntityType);
