import { z } from "zod";
import { memberSchema } from "#/guild/types/Member.ts";
import { userSchema } from "#/user/types/User.ts";

export const scheduledEventUserSchema = z.object({
  /** the scheduled event id which the user subscribed to */
  guildScheduledEventId: z.string().min(1),
  /** user which subscribed to an event */
  user: userSchema,
  /** guild member data for this user for the guild which this event belongs to, if any */
  member: memberSchema.nullable()
});

export type ScheduledEventUser = z.infer<typeof scheduledEventUserSchema>;
