import { z } from "zod";
import { user } from "../../user";

export const member = z.object({
  /** the user this guild member represents */
  user: user.optional(),
  /** this user's guild nickname */
  nick: z.string().optional(),
  /** the member's guild avatar hash */
  avatar: z.string().optional(),
  /** array of role object ids */
  roles: z.string().array(),
  /** when the user joined the guild */
  joinedAt: z.number(),
  /** when the user started boosting the guild */
  premiumSince: z.number().optional(),
  /** whether the user is deafened in voice channels */
  deaf: z.boolean(),
  /** whether the user is muted in voice channels */
  mute: z.boolean(),
  /** whether the user has not yet passed the guild's Membership Screening requirements */
  pending: z.boolean().optional(),
  /** total permissions of the member in the channel, including overwrites, returned when in the interaction object */
  permissions: z.string().optional(),
  /** when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out */
  communicationDisabledUntil: z.number().optional()
});

export type Member = z.infer<typeof member>;
