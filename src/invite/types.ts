import type { Application } from "../application";
import type { Channel } from "../channel";
import type { ScheduledEvent } from "../event";
import type { Guild, Member } from "../guild";
import type { User } from "../user";

export interface Invite {
  /** the invite code (unique ID) */
  code: string;
  /** the guild this invite is for */
  guild?: Partial<Guild>;
  /** the channel this invite is for */
  channel?: Partial<Channel>;
  /** the user who created the invite */
  inviter?: User;
  /** the type of target for this voice channel invite */
  targetType?: InviteTarget;
  /** the user whose stream to display for this voice channel stream invite */
  targetUser?: User;
  /** the embedded application to open for this voice channel embedded application invite */
  targetApplication?: Partial<Application>;
  /** approximate count of online members, returned from the GET /invites/<code> endpoint when with_counts is true */
  approximatePresenceCount?: number;
  /** approximate count of total members, returned from the GET /invites/<code> endpoint when with_counts is true */
  approximateMemberCount?: number;
  /** the expiration date of this invite, returned from the GET /invites/<code> endpoint when with_expiration is true */
  expiresAt?: string;
  /** stage instance data if there is a public Stage instance in the Stage channel this invite is for (deprecated) */
  stageInstance?: InviteStageInstance;
  /** guild scheduled event data, only included if guild_scheduled_event_id contains a valid guild scheduled event id */
  guildScheduledEvent?: ScheduledEvent;
}

export enum InviteTarget {
  STREAM = 1,
  EMBEDDED_APPLICATION = 2
}

export interface InviteStageInstance {
  /** the members speaking in the Stage */
  members: Partial<Member>[];
  /** the number of users in the Stage */
  participantCount: number;
  /** the number of users speaking in the Stage */
  speakerCount: number;
  /** the topic of the Stage instance (1-120 characters) */
  topic: string;
}
