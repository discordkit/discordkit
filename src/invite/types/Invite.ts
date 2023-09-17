import { z } from "zod";
import { application } from "../../application/types/Application";
import { channel } from "../../channel/types/Channel";
import { scheduledEvent } from "../../event";
import { guild } from "../../guild/types/Guild";
import { user } from "../../user";
import { inviteStageInstance } from "./InviteStageInstance";
import { inviteTarget } from "./InviteTarget";

export const invite = z.object({
  /** the invite code (unique ID) */
  code: z.string(),
  /** the guild this invite is for */
  guild: guild.partial().optional(),
  /** the channel this invite is for */
  channel: channel.partial().optional(),
  /** the user who created the invite */
  inviter: user.optional(),
  /** the type of target for this voice channel invite */
  targetType: inviteTarget.optional(),
  /** the user whose stream to display for this voice channel stream invite */
  targetUser: user.optional(),
  /** the embedded application to open for this voice channel embedded application invite */
  targetApplication: application.partial().optional(),
  /** approximate count of online members, returned from the GET /invites/<code> endpoint when with_counts is true */
  approximatePresenceCount: z.number().optional(),
  /** approximate count of total members, returned from the GET /invites/<code> endpoint when with_counts is true */
  approximateMemberCount: z.number().optional(),
  /** the expiration date of this invite, returned from the GET /invites/<code> endpoint when with_expiration is true */
  expiresAt: z.string().optional(),
  /** stage instance data if there is a public Stage instance in the Stage channel this invite is for (deprecated) */
  stageInstance: inviteStageInstance.optional(),
  /** guild scheduled event data, only included if guild_scheduled_event_id contains a valid guild scheduled event id */
  guildScheduledEvent: scheduledEvent.optional()
});

export type Invite = z.infer<typeof invite>;
