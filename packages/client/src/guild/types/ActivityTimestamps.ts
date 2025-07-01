import { object, optional, number, type InferOutput } from "valibot";

export const activityTimestampsSchema = object({
  /** unix time (in milliseconds) of when the activity started */
  start: optional(number()),
  /** unix time (in milliseconds) of when the activity ends */
  end: optional(number())
});

export interface ActivityTimestamps
  extends InferOutput<typeof activityTimestampsSchema> {}
