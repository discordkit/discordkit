import { object, optional, number, type Output } from "valibot";

export const activityTimestampsSchema = object({
  /** unix time (in milliseconds) of when the activity started */
  start: optional(number()),
  /** unix time (in milliseconds) of when the activity ends */
  end: optional(number())
});

export type ActivityTimestamps = Output<typeof activityTimestampsSchema>;
