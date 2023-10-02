import { z } from "zod";
import { applicationSchema } from "../../application/types/Application.ts";
import { channelSchema } from "../../channel/types/Channel.ts";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent.ts";
import { guildSchema } from "../../guild/types/Guild.ts";
import { userSchema } from "../../user/types/User.ts";
import { inviteStageInstanceSchema } from "./InviteStageInstance.ts";
import { inviteTargetSchema } from "./InviteTarget.ts";

export const inviteSchema = z.object({
  /** the invite code (unique ID) */
  code: z.string(),
  /** the guild this invite is for */
  guild: guildSchema.partial().nullish(),
  /** the channel this invite is for */
  channel: channelSchema.partial().optional(),
  /** the user who created the invite */
  inviter: userSchema.nullish(),
  /** the type of target for this voice channel invite */
  targetType: inviteTargetSchema.nullish(),
  /** the user whose stream to display for this voice channel stream invite */
  targetUser: userSchema.nullish(),
  /** the embedded application to open for this voice channel embedded application invite */
  targetApplication: applicationSchema.partial().nullish(),
  /** approximate count of online members, returned from the GET /invites/<code> endpoint when with_counts is true */
  approximatePresenceCount: z.number().nullish(),
  /** approximate count of total members, returned from the GET /invites/<code> endpoint when with_counts is true */
  approximateMemberCount: z.number().nullish(),
  /** the expiration date of this invite, returned from the GET /invites/<code> endpoint when with_expiration is true */
  expiresAt: z.string().nullish(),
  /** stage instance data if there is a public Stage instance in the Stage channel this invite is for (deprecated) */
  stageInstance: inviteStageInstanceSchema.nullish(),
  /** guild scheduled event data, only included if guild_scheduled_event_id contains a valid guild scheduled event id */
  guildScheduledEvent: scheduledEventSchema.nullish()
});

export type Invite = z.infer<typeof inviteSchema>;
