import type { Relationship } from "@discordkit/tauri/renderer/relationships";
import type { User } from "@discordkit/tauri/renderer/users";
import { userAvatar, defaultUserAvatar } from "@discordkit/client";
import { nameOf } from "../sections.js";
import { StatusDot, STATUS_LABEL, toDisplayStatus } from "./StatusDot.js";
import { DiscordBadge } from "./DiscordBadge.js";

/**
 * One friend row (Figma "Entry"): avatar with an overlapping status dot, the
 * display name, the status text line, and — when shown — the Discord badge
 * marking "universal communication" (an online-elsewhere friend reachable via
 * Discord anywhere). Per spec, the badge never appears on provisional accounts.
 *
 * `density` (a Studio control) trades vertical padding + avatar size for how many
 * rows fit; `showBadge` toggles the Discord badge so the dev can see both states.
 */

export interface FriendEntryProps {
  relationship: Relationship;
  /** Show the Discord "universal communication" badge (suppressed if provisional). */
  showBadge: boolean;
  density: `comfortable` | `compact`;
}

export const FriendEntry = ({
  relationship,
  showBadge,
  density
}: FriendEntryProps): React.JSX.Element => {
  const user = relationship.user;
  const status = toDisplayStatus(user?.status);
  const name = nameOf(relationship);
  const provisional = user?.provisional ?? false;
  const compact = density === `compact`;
  // Pixel size mirrors the `size-*` class so the <img> gets explicit dimensions
  // (no layout shift): compact = size-7 (28px), comfortable = size-9 (36px).
  const avatarPx = compact ? 28 : 36;
  const avatarUrl = user ? resolveAvatar(user) : undefined;

  return (
    <div
      className={`flex items-center gap-3 rounded-md px-2 hover:bg-hover-tint ${
        compact ? `py-1` : `py-1.5`
      }`}
    >
      <div className="relative shrink-0">
        <Avatar src={avatarUrl} size={avatarPx} />
        <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-section p-0.5">
          <StatusDot status={status} size={compact ? 9 : 10} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-text">{name}</span>
          {showBadge && !provisional ? <DiscordBadge /> : null}
        </div>
        {!compact ? (
          <span className="block text-xs text-text-muted">
            {STATUS_LABEL[status]}
          </span>
        ) : null}
      </div>
    </div>
  );
};

/**
 * Build a user's avatar URL. `user.avatar` is a hash, not a URL: when set we build the CDN URL from it (requesting `.gif` for animated avatars, whose hash is prefixed `a_`); when unset we fall back to Discord's default avatar, picked by `(id >> 22) % 6` for the modern username system (legacy discriminator avatars aren't surfaced by the Social SDK).
 */
const resolveAvatar = (user: User): string =>
  user.avatar !== undefined
    ? userAvatar({
        user: user.id,
        avatar: user.avatar,
        format: user.avatar.startsWith(`a_`) ? `gif` : `png`
      })
    : defaultUserAvatar({ index: String((BigInt(user.id) >> 22n) % 6n) });

/** Avatar image with a neutral placeholder fallback (matches the Figma checker swatch). */
const Avatar = ({
  src,
  size
}: {
  src?: string;
  size: number;
}): React.JSX.Element =>
  src ? (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="rounded-md object-cover"
      loading="lazy"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="rounded-md bg-fill"
      aria-hidden="true"
    />
  );
