import { type InferOutput, object, exactOptional } from "valibot";
import { snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";
import { userSchema } from "../../user/types/User.js";

export const scheduledEventUserSchema = object({
  /** the scheduled event id which the user subscribed to */
  guildScheduledEventId: snowflake,
  /** user which subscribed to an event */
  user: userSchema,
  /** guild member data for this user for the guild which this event belongs to, if any */
  member: exactOptional(memberSchema)
});

export type ScheduledEventUser = InferOutput<typeof scheduledEventUserSchema>;
