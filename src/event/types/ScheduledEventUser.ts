import { z } from "zod";
import { member } from "../../guild/types/Member";
import { user } from "../../user";

export const scheduledEventUser = z.object({
  /** the scheduled event id which the user subscribed to */
  guildScheduledEventId: z.string(),
  /** user which subscribed to an event */
  user,
  /** guild member data for this user for the guild which this event belongs to, if any */
  member: member.optional()
});

export type ScheduledEventUser = z.infer<typeof scheduledEventUser>;
