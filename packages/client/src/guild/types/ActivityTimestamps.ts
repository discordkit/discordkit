import { z } from "zod";

export const activityTimestampsSchema = z.object({
  /** unix time (in milliseconds) of when the activity started */
  start: z.number().optional(),
  /** unix time (in milliseconds) of when the activity ends */
  end: z.number().optional()
});

export type ActivityTimestamps = z.infer<typeof activityTimestampsSchema>;
