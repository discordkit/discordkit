import * as v from "valibot";

export const activityTimestampsSchema = v.object({
  /** unix time (in milliseconds) of when the activity started */
  start: v.exactOptional(v.number()),
  /** unix time (in milliseconds) of when the activity ends */
  end: v.exactOptional(v.number())
});

export interface ActivityTimestamps
  extends v.InferOutput<typeof activityTimestampsSchema> {}
