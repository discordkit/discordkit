import { z } from "zod";
import { applicationSchema } from "../../application/types/Application";
import { channelSchema } from "../../channel/types/Channel";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent";
import { guildSchema } from "../../guild/types/Guild";
import { userSchema } from "../../user/types/User";
import { inviteStageInstanceSchema } from "./InviteStageInstance";
import { inviteTargetSchema } from "./InviteTarget";

export const inviteSchema = z.object({
  /** the invite code (unique ID) */
  code: z.string(),
  /** the guild this invite is for */
  guild: guildSchema.partial().optional(),
  /** the channel this invite is for */
  channel: channelSchema.partial().optional(),
  /** the user who created the invite */
  inviter: userSchema.optional(),
  /** the type of target for this voice channel invite */
  targetType: inviteTargetSchema.optional(),
  /** the user whose stream to display for this voice channel stream invite */
  targetUser: userSchema.optional(),
  /** the embedded application to open for this voice channel embedded application invite */
  targetApplication: applicationSchema.partial().optional(),
  /** approximate count of online members, returned from the GET /invites/<code> endpoint when with_counts is true */
  approximatePresenceCount: z.number().optional(),
  /** approximate count of total members, returned from the GET /invites/<code> endpoint when with_counts is true */
  approximateMemberCount: z.number().optional(),
  /** the expiration date of this invite, returned from the GET /invites/<code> endpoint when with_expiration is true */
  expiresAt: z.string().optional(),
  /** stage instance data if there is a public Stage instance in the Stage channel this invite is for (deprecated) */
  stageInstance: inviteStageInstanceSchema.optional(),
  /** guild scheduled event data, only included if guild_scheduled_event_id contains a valid guild scheduled event id */
  guildScheduledEvent: scheduledEventSchema.optional()
});

export type Invite = z.infer<typeof inviteSchema>;
