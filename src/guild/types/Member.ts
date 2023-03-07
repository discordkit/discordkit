import type { User } from "../../user";

export interface Member {
  /** the user this guild member represents */
  user?: User;
  /** this user's guild nickname */
  nick?: string;
  /** the member's guild avatar hash */
  avatar?: string;
  /** array of role object ids */
  roles: string[];
  /** when the user joined the guild */
  joinedAt: number;
  /** when the user started boosting the guild */
  premiumSince?: number;
  /** whether the user is deafened in voice channels */
  deaf: boolean;
  /** whether the user is muted in voice channels */
  mute: boolean;
  /** whether the user has not yet passed the guild's Membership Screening requirements */
  pending?: boolean;
  /** total permissions of the member in the channel, including overwrites, returned when in the interaction object */
  permissions?: string;
  /** when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out */
  communicationDisabledUntil?: number;
}
