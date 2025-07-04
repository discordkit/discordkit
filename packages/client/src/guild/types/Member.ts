import * as v from "valibot";
import {
  asDigits,
  asInteger,
  snowflake,
  timestamp,
  boundedString
} from "@discordkit/core";
import { type User, userSchema } from "../../user/types/User.js";
import { guildMemberFlag } from "./GuildMemberFlags.js";
import { permissionFlag } from "../../permissions/Permissions.js";
import { avatarDecorationDataSchema } from "../../user/types/AvatarDecorationData.js";

export const memberSchema = v.object({
  /** the user this guild member represents */
  user: v.exactOptional<v.GenericSchema<User>>(userSchema),
  /** this user's guild nickname */
  nick: v.nullish(boundedString()),
  /** the member's guild avatar hash */
  avatar: v.nullish(boundedString()),
  /** the member's guild banner hash */
  banner: v.nullish(boundedString()),
  /** array of role object ids */
  roles: v.array(snowflake),
  /** when the user joined the guild */
  joinedAt: timestamp,
  /** when the user started boosting the guild */
  premiumSince: v.nullish(timestamp),
  /** whether the user is deafened in voice channels */
  deaf: v.boolean(),
  /** whether the user is muted in voice channels */
  mute: v.boolean(),
  /** guild member flags represented as a bit set, defaults to 0 */
  flags: asInteger(guildMemberFlag),
  /** whether the user has not yet passed the guild's Membership Screening requirements */
  pending: v.exactOptional(v.boolean()),
  /** total permissions of the member in the channel, including overwrites, returned when in the interaction object */
  permissions: v.exactOptional(asDigits(permissionFlag)),
  /** when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out */
  communicationDisabledUntil: v.nullish(timestamp),
  /** data for the member's guild avatar decoration */
  avatarDecorationData: v.nullish(avatarDecorationDataSchema)
});

export interface Member extends v.InferOutput<typeof memberSchema> {}
