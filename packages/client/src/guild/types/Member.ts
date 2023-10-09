import {
  object,
  nullish,
  string,
  array,
  isoTimestamp,
  number,
  integer,
  boolean,
  optional,
  type Output
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";

export const memberSchema = object({
  /** the user this guild member represents */
  user: nullish(userSchema),
  /** this user's guild nickname */
  nick: nullish(string()),
  /** the member's guild avatar hash */
  avatar: nullish(string()),
  /** array of role object ids */
  roles: array(snowflake),
  /** when the user joined the guild */
  joinedAt: string([isoTimestamp()]),
  /** when the user started boosting the guild */
  premiumSince: nullish(string([isoTimestamp()])),
  /** whether the user is deafened in voice channels */
  deaf: boolean(),
  /** whether the user is muted in voice channels */
  mute: boolean(),
  /** guild member flags represented as a bit set, defaults to 0 */
  flags: optional(number([integer()]), 0),
  /** whether the user has not yet passed the guild's Membership Screening requirements */
  pending: nullish(boolean()),
  /** total permissions of the member in the channel, including overwrites, returned when in the interaction object */
  permissions: nullish(string()),
  /** when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out */
  communicationDisabledUntil: nullish(string([isoTimestamp()]))
});

export type Member = Output<typeof memberSchema>;
