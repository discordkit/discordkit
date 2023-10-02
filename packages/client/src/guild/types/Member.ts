import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.ts";

export const memberSchema = z.object({
  /** the user this guild member represents */
  user: userSchema.nullish(),
  /** this user's guild nickname */
  nick: z.string().nullish(),
  /** the member's guild avatar hash */
  avatar: z.string().nullish(),
  /** array of role object ids */
  roles: snowflake.array(),
  /** when the user joined the guild */
  joinedAt: z.string().datetime(),
  /** when the user started boosting the guild */
  premiumSince: z.string().datetime().nullish(),
  /** whether the user is deafened in voice channels */
  deaf: z.boolean(),
  /** whether the user is muted in voice channels */
  mute: z.boolean(),
  /** guild member flags represented as a bit set, defaults to 0 */
  flags: z.number().int().default(0),
  /** whether the user has not yet passed the guild's Membership Screening requirements */
  pending: z.boolean().nullish(),
  /** total permissions of the member in the channel, including overwrites, returned when in the interaction object */
  permissions: z.string().nullish(),
  /** when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out */
  communicationDisabledUntil: z.string().datetime().nullish()
});

export type Member = z.infer<typeof memberSchema>;
