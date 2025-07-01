import * as v from "valibot";

export enum ScheduledEventEntityType {
  STAGE_INSTANCE = 1,
  VOICE = 2,
  EXTERNAL = 3
}

export const scheduledEventEntityTypeSchema = v.enum_(ScheduledEventEntityType);
