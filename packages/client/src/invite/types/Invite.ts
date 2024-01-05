import {
  object,
  string,
  partial,
  nullish,
  optional,
  number,
  type Output
} from "valibot";
import { applicationSchema } from "../../application/types/Application.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent.js";
import { guildSchema } from "../../guild/types/Guild.js";
import { userSchema } from "../../user/types/User.js";
import { inviteStageInstanceSchema } from "./InviteStageInstance.js";
import { inviteTargetSchema } from "./InviteTarget.js";

export const inviteSchema = object({
  /** the invite code (unique ID) */
  code: string(),
  /** the guild this invite is for */
  guild: nullish(partial(guildSchema)),
  /** the channel this invite is for */
  channel: optional(partial(channelSchema)),
  /** the user who created the invite */
  inviter: nullish(userSchema),
  /** the type of target for this voice channel invite */
  targetType: nullish(inviteTargetSchema),
  /** the user whose stream to display for this voice channel stream invite */
  targetUser: nullish(userSchema),
  /** the embedded application to open for this voice channel embedded application invite */
  targetApplication: nullish(partial(applicationSchema)),
  /** approximate count of online members, returned from the GET /invites/<code> endpoint when with_counts is true */
  approximatePresenceCount: nullish(number()),
  /** approximate count of total members, returned from the GET /invites/<code> endpoint when with_counts is true */
  approximateMemberCount: nullish(number()),
  /** the expiration date of this invite, returned from the GET /invites/<code> endpoint when with_expiration is true */
  expiresAt: nullish(string()),
  /** stage instance data if there is a public Stage instance in the Stage channel this invite is for (deprecated) */
  stageInstance: nullish(inviteStageInstanceSchema),
  /** guild scheduled event data, only included if guild_scheduled_event_id contains a valid guild scheduled event id */
  guildScheduledEvent: nullish(scheduledEventSchema)
});

export type Invite = Output<typeof inviteSchema>;
