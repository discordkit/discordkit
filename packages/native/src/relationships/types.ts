import type { User } from "../users/types.js";

/**
 * Public types for the relationships domain. A `RelationshipHandle` is read into a plain {@link Relationship} snapshot (read-handle convention) that embeds the target {@link User} — a relationship inherently *is* a relationship to a user, so the snapshot carries it directly.
 */

/**
 * Kind of relationship, the public string form of `Discord_RelationshipType`.
 * A user can hold a Discord-level and a game-level relationship at once (e.g. a
 * game `friend` who has a `pendingIncoming` Discord request).
 */
export type RelationshipType =
  | `none`
  | `friend`
  | `blocked`
  | `pendingIncoming`
  | `pendingOutgoing`
  | `implicit`
  | `suggestion`;

/** Maps the ABI's numeric `Discord_RelationshipType` to the public string form. */
export const RELATIONSHIP_TYPE_BY_CODE: Record<number, RelationshipType> = {
  0: `none`,
  1: `friend`,
  2: `blocked`,
  3: `pendingIncoming`,
  4: `pendingOutgoing`,
  5: `implicit`,
  6: `suggestion`
};

/**
 * A snapshot of the relationship between the current user and a target user. The SDK tracks two independent types — `discordType` persists across games and on the Discord client; `gameType` is per-game — see the class docs for how they interact (a game friend can "upgrade" to a Discord friend).
 */
export interface Relationship {
  /** The target user's ID. */
  userId: bigint;
  /** Cross-game / Discord-client relationship type. Blocks always live here. */
  discordType: RelationshipType;
  /** Per-game relationship type. */
  gameType: RelationshipType;
  /** Whether this relationship is flagged as a spam request. */
  spamRequest: boolean;
  /** The target user, if the SDK has their handle available. */
  user?: User;
}
