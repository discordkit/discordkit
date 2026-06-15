/** The activity-invites domain's IPC contract. Mirrors `@discordkit/native/activity-invites`. */
import type { ActivityInvite } from "@discordkit/native/activity-invites";

export const INVITE_CHANNELS = {
  send: `discordkit:invites:send`,
  sendJoinRequest: `discordkit:invites:sendJoinRequest`,
  replyJoinRequest: `discordkit:invites:replyJoinRequest`,
  accept: `discordkit:invites:accept`,
  created: `discordkit:invites:created`,
  updated: `discordkit:invites:updated`
} as const;

/** The `window.discord.invites` namespace. */
export interface InvitesBridge {
  send: (userId: bigint, content?: string) => Promise<void>;
  sendJoinRequest: (userId: bigint) => Promise<void>;
  replyToJoinRequest: (invite: ActivityInvite) => Promise<void>;
  /** Accept an invite; resolves with the join secret for the game's party system. */
  accept: (invite: ActivityInvite) => Promise<string>;
  /** Subscribe to incoming invites. Returns an unsubscribe function. */
  onCreated: (handler: (invite: ActivityInvite) => void) => () => void;
  /** Subscribe to invite updates (e.g. an invite going invalid). */
  onUpdated: (handler: (invite: ActivityInvite) => void) => () => void;
}
