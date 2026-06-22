import type { Relationship } from "@discordkit/tauri/renderer/relationships";
import type { StatusType } from "@discordkit/native/users";

/**
 * Turn the flat relationships list into the design-spec sections, ordered by
 * descending availability (`unified-friends-list` guideline):
 *   Online — {GameTitle}  ·  Online — Elsewhere  ·  Offline
 *
 * Honest data note: a read-only relationships list tells us each friend's
 * `status` (online/idle/dnd/offline/…) but NOT whether they're in *our* game —
 * that needs each friend's rich-presence/activity, which this read doesn't carry.
 * So "in-game" membership is a Studio control (`inGameIds`): the dev simulates
 * which friends are in the game to preview the three-section layout. With an empty
 * set you get the real two-section split (Online elsewhere / Offline).
 */

export type SectionKey = `in-game` | `elsewhere` | `offline`;

export interface FriendsSection {
  key: SectionKey;
  /** Display label, e.g. "Online — Acme Quest" / "Online — Elsewhere" / "Offline". */
  label: string;
  members: Relationship[];
}

/** A friend counts as "online" for sectioning if their status isn't offline/invisible. */
const ONLINE_STATUSES = new Set<StatusType>([
  `online`,
  `idle`,
  `dnd`,
  `streaming`
]);

export const isOnline = (status: StatusType | undefined): boolean =>
  status !== undefined && ONLINE_STATUSES.has(status);

export interface SectioningOptions {
  /** The game's display name for the in-game section header. */
  gameTitle: string;
  /** User ids the Studio simulates as "in this game" (preview of the in-game section). */
  inGameIds: ReadonlySet<string>;
}

/**
 * Section a relationships list. Only `friend` relationships are shown (pending /
 * blocked / suggestions belong in their own surfaces, out of scope for the list).
 * Sorted within each section by display name for a stable, scannable order.
 */
export const sectionFriends = (
  relationships: readonly Relationship[],
  { gameTitle, inGameIds }: SectioningOptions
): FriendsSection[] => {
  const friends = relationships.filter(
    (r) => r.discordType === `friend` || r.gameType === `friend`
  );

  const inGame: Relationship[] = [];
  const elsewhere: Relationship[] = [];
  const offline: Relationship[] = [];

  for (const r of friends) {
    if (!isOnline(r.user?.status)) offline.push(r);
    else if (inGameIds.has(r.userId)) inGame.push(r);
    else elsewhere.push(r);
  }

  const byName = (a: Relationship, b: Relationship): number =>
    nameOf(a).localeCompare(nameOf(b));
  inGame.sort(byName);
  elsewhere.sort(byName);
  offline.sort(byName);

  const sections: FriendsSection[] = [
    { key: `in-game`, label: `Online — ${gameTitle}`, members: inGame },
    { key: `elsewhere`, label: `Online — Elsewhere`, members: elsewhere },
    { key: `offline`, label: `Offline`, members: offline }
  ];
  // Drop empty sections except keep at least Offline visible as a landing target.
  return sections.filter((s) => s.members.length > 0 || s.key === `offline`);
};

/** Best display name for a relationship's user (per the identity-priority spec). */
export const nameOf = (r: Relationship): string =>
  r.user?.globalName ?? r.user?.displayName ?? r.user?.username ?? r.userId;
