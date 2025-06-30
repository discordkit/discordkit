import {
  object,
  nullish,
  string,
  array,
  isoTimestamp,
  boolean,
  pipe,
  type InferOutput,
  exactOptional,
  nonEmpty
} from "valibot";
import { asDigits, asInteger, snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { guildMemberFlag } from "./GuildMemberFlags.js";
import { permissionFlag } from "../../permissions/Permissions.js";
import { avatarDecorationDataSchema } from "../../user/types/AvatarDecorationData.js";

export const memberSchema = object({
  /** the user this guild member represents */
  user: exactOptional(userSchema),
  /** this user's guild nickname */
  nick: nullish(pipe(string(), nonEmpty())),
  /** the member's guild avatar hash */
  avatar: nullish(pipe(string(), nonEmpty())),
  /** the member's guild banner hash */
  banner: nullish(pipe(string(), nonEmpty())),
  /** array of role object ids */
  roles: array(snowflake),
  /** when the user joined the guild */
  joinedAt: pipe(string(), isoTimestamp()),
  /** when the user started boosting the guild */
  premiumSince: nullish(pipe(string(), isoTimestamp())),
  /** whether the user is deafened in voice channels */
  deaf: boolean(),
  /** whether the user is muted in voice channels */
  mute: boolean(),
  /** guild member flags represented as a bit set, defaults to 0 */
  flags: asInteger(guildMemberFlag),
  /** whether the user has not yet passed the guild's Membership Screening requirements */
  pending: exactOptional(boolean()),
  /** total permissions of the member in the channel, including overwrites, returned when in the interaction object */
  permissions: exactOptional(asDigits(permissionFlag)),
  /** when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out */
  communicationDisabledUntil: nullish(pipe(string(), isoTimestamp())),
  /** data for the member's guild avatar decoration */
  avatarDecorationData: nullish(avatarDecorationDataSchema)
});

export type Member = InferOutput<typeof memberSchema>;
