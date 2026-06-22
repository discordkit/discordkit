/**
 * Activity invites — the public surface of `@discordkit/native/activity-invites`.
 *
 * The join/spectate half of rich presence. Send invites and join requests
 * ({@link sendActivityInvite}, {@link sendActivityJoinRequest}), reply to and
 * accept them ({@link replyToActivityJoinRequest}, {@link acceptActivityInvite} —
 * which resolves with the join secret), and listen for incoming invites
 * ({@link onActivityInviteCreated}, {@link onActivityInviteUpdated}) as plain
 * {@link ActivityInvite} snapshots.
 *
 * Per the SDK: only act on an invite in response to explicit user intent.
 */
export {
  sendActivityInvite,
  sendActivityJoinRequest,
  replyToActivityJoinRequest,
  acceptActivityInvite,
  onActivityInviteCreated,
  onActivityInviteUpdated
} from "./activityInvites.js";
export type { ActivityInviteOptions } from "./activityInvites.js";
export { readActivityInvite, buildActivityInvite } from "./activityInvite.js";

export type { ActivityInvite, ActivityActionType } from "./types.js";
