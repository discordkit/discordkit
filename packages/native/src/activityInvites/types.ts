/**
 * Public types for the activity-invites domain — plain interfaces + an enum string-union, no FFI bindings (importing them costs nothing). An `ActivityInvite` arrives via the SDK's invite callbacks and is read into the {@link ActivityInvite} snapshot rather than surfaced as a live wrapper: it's read-only data, so a plain object is simpler and carries no dispose burden (the read-handle convention). The same snapshot is handed back to `acceptActivityInvite` / `replyToActivityJoinRequest`, which re-marshal it into a native handle to act on.
 */

import type {
  ApplicationId,
  ChannelId,
  MessageId,
  UserId
} from "../snowflake.js";

/**
 * The kind of activity invite, the public string form of `Discord_ActivityActionTypes`. There are two: a user with an existing party can `join`-invite another user, or a user can request to join another's party (`joinRequest`). `invalid` is the SDK's uninitialized sentinel.
 */
export type ActivityActionType = `invalid` | `join` | `joinRequest`;

/**
 * Maps the ABI's numeric `Discord_ActivityActionTypes` to the public string form. NOTE: the ABI values are non-contiguous (`Invalid=0, Join=1, JoinRequest=5`) — see `cdiscord.h` — so this is a sparse lookup, not an index.
 */
export const ACTIVITY_ACTION_TYPE_BY_CODE: Record<number, ActivityActionType> =
  {
    0: `invalid`,
    1: `join`,
    5: `joinRequest`
  };

/** The reverse map, for marshaling a snapshot back into a native handle. */
export const ACTIVITY_ACTION_TYPE_CODE: Record<ActivityActionType, number> = {
  invalid: 0,
  join: 1,
  joinRequest: 5
};

/**
 * A snapshot of an activity invite, read from a native `ActivityInvite` at one moment. The SDK parses Discord messages for invites automatically and surfaces them through the created/updated callbacks; this is the parsed result, carrying everything needed to later accept it. All IDs are bigints (snowflakes exceed 2^53).
 */
export interface ActivityInvite {
  /** The type of invite — a `join` invite or a `joinRequest`. */
  type: ActivityActionType;
  /** The user id of the user who sent the invite. */
  senderId: UserId;
  /** The id of the Discord channel in which the invite was sent. */
  channelId: ChannelId;
  /** The id of the Discord message that contains the invite. */
  messageId: MessageId;
  /** The target application of the invite. */
  applicationId: ApplicationId;
  /**
   * The application id of the parent — only set for a publisher's suite of
   * applications, otherwise `0n`.
   */
  parentApplicationId: ApplicationId;
  /** The id of the party the invite was sent for. */
  partyId: string;
  /** The session id of the user who sent the invite. */
  sessionId: string;
  /**
   * Whether this invite is currently joinable. An invite becomes invalid once
   * it's more than 6 hours old or the sender stops playing the game it's for.
   */
  valid: boolean;
}
