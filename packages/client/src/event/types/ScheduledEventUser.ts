import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";
import { userSchema } from "../../user/types/User.js";

export const scheduledEventUserSchema = z.object({
  /** the scheduled event id which the user subscribed to */
  guildScheduledEventId: snowflake,
  /** user which subscribed to an event */
  user: userSchema,
  /** guild member data for this user for the guild which this event belongs to, if any */
  member: memberSchema.nullish()
});

export type ScheduledEventUser = z.infer<typeof scheduledEventUserSchema>;
