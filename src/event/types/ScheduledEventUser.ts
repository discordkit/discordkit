import type { Member } from "../../guild";
import type { User } from "../../user";

export interface ScheduledEventUser {
  /** the scheduled event id which the user subscribed to */
  guildScheduledEventId: string;
  /** user which subscribed to an event */
  user: User;
  /** guild member data for this user for the guild which this event belongs to, if any */
  member?: Member;
}
