import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";
import { userSchema } from "../../user/types/User.js";

export const scheduledEventUserSchema = v.object({
  /** the scheduled event id which the user subscribed to */
  guildScheduledEventId: snowflake,
  /** user which subscribed to an event */
  user: userSchema,
  /** guild member data for this user for the guild which this event belongs to, if any */
  member: v.exactOptional(memberSchema)
});

export interface ScheduledEventUser
  extends v.InferOutput<typeof scheduledEventUserSchema> {}
