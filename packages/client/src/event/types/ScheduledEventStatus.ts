import { enum_ } from "valibot";

export enum ScheduledEventStatus {
  SCHEDULED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELED = 4
}

export const scheduledEventStatusSchema = enum_(ScheduledEventStatus);
