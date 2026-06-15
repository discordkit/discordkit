/**
 * Public types for the users domain — plain interfaces + enum string-unions, no FFI bindings (importing them costs nothing). The SDK's `UserHandle` is read into the {@link User} snapshot rather than surfaced as a live wrapper: it's a read-only value, so a plain object is simpler and carries no dispose burden (the default per the package's read-handle convention).
 */

import type { UserId } from "../snowflake.js";

/** A user's online presence, the public string form of `Discord_StatusType`. */
export type StatusType =
  | `online`
  | `offline`
  | `blocked`
  | `idle`
  | `dnd`
  | `invisible`
  | `streaming`
  | `unknown`;

/** Maps the ABI's numeric `Discord_StatusType` to the public string form. */
export const STATUS_TYPE_BY_CODE: Record<number, StatusType> = {
  0: `online`,
  1: `offline`,
  2: `blocked`,
  3: `idle`,
  4: `dnd`,
  5: `invisible`,
  6: `streaming`,
  7: `unknown`
};

/** Desired avatar image format, mirrors `Discord_UserHandle_AvatarType`. */
export type AvatarType = `gif` | `webp` | `png` | `jpeg`;

/** ABI numeric values for `Discord_UserHandle_AvatarType`. */
export const AVATAR_TYPE: Record<AvatarType, number> = {
  gif: 0,
  webp: 1,
  png: 2,
  jpeg: 3
};

/**
 * A snapshot of a Discord user, read from a native `UserHandle` at one moment. Fields the SDK reports as optional (`std::optional<...>`) are `undefined` when unset. The user's `id` is a bigint (snowflakes exceed 2^53).
 */
export interface User {
  /** The user's unique ID. (A handle reporting `0n` is no longer valid.) */
  id: UserId;
  /** Globally unique username. Auto-generated for provisional accounts. */
  username: string;
  /** Preferred name if set, otherwise the username. */
  displayName: string;
  /** Discord's "global name" (preferred display name), if one is set. */
  globalName?: string;
  /** Avatar hash, if the user has set a custom avatar. */
  avatar?: string;
  /** Online/offline/idle/etc. status. */
  status: StatusType;
  /** Whether this is a provisional (not-yet-full-Discord) account. */
  provisional: boolean;
}
