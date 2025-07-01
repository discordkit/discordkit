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
  nonEmpty,
  type GenericSchema
} from "valibot";
import { asDigits, asInteger, snowflake } from "@discordkit/core";
import { type User, userSchema } from "../../user/types/User.js";
import { guildMemberFlag } from "./GuildMemberFlags.js";
import { permissionFlag } from "../../permissions/Permissions.js";
import { avatarDecorationDataSchema } from "../../user/types/AvatarDecorationData.js";

export const memberSchema = object({
  /** the user this guild member represents */
  user: exactOptional<GenericSchema<User>>(userSchema),
  /** this user's guild nickname */
  nick: nullish<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** the member's guild avatar hash */
  avatar: nullish<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** the member's guild banner hash */
  banner: nullish<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** array of role object ids */
  roles: array<GenericSchema<string>>(snowflake),
  /** when the user joined the guild */
  joinedAt: pipe(string(), isoTimestamp()) as GenericSchema<string>,
  /** when the user started boosting the guild */
  premiumSince: nullish<GenericSchema<string>>(pipe(string(), isoTimestamp())),
  /** whether the user is deafened in voice channels */
  deaf: boolean(),
  /** whether the user is muted in voice channels */
  mute: boolean(),
  /** guild member flags represented as a bit set, defaults to 0 */
  flags: asInteger(guildMemberFlag) as GenericSchema<number>,
  /** whether the user has not yet passed the guild's Membership Screening requirements */
  pending: exactOptional(boolean()),
  /** total permissions of the member in the channel, including overwrites, returned when in the interaction object */
  permissions: exactOptional(asDigits(permissionFlag) as GenericSchema<string>),
  /** when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out */
  communicationDisabledUntil: nullish<GenericSchema<string>>(
    pipe(string(), isoTimestamp())
  ),
  /** data for the member's guild avatar decoration */
  avatarDecorationData: nullish(avatarDecorationDataSchema)
});

export interface Member extends InferOutput<typeof memberSchema> {}
