import type { StatusType } from "@discordkit/native/users";

/**
 * The status indicator dot — the heart of the design spec's "status matrix".
 * Core colors (green/amber/red/gray) and the symbol cutouts (none/moon/minus/
 * ring) must read consistently with Discord per the `status-rich-presence`
 * guideline; everything else (size, ring) is the game's choice. Sits overlapping
 * the avatar's bottom-right corner.
 */

export type DisplayStatus = `online` | `idle` | `dnd` | `offline`;

/**
 * Map the SDK's richer status set to the four core display statuses. Anything
 * that isn't actively online/idle/dnd (offline, invisible, blocked, unknown, or
 * absent) reads as offline.
 */
const DISPLAY_BY_STATUS: Partial<Record<StatusType, DisplayStatus>> = {
  online: `online`,
  streaming: `online`,
  idle: `idle`,
  dnd: `dnd`
};

export const toDisplayStatus = (
  status: StatusType | undefined
): DisplayStatus => (status && DISPLAY_BY_STATUS[status]) || `offline`;

const STATUS_COLOR: Record<DisplayStatus, string> = {
  online: `var(--color-status-online)`,
  idle: `var(--color-status-idle)`,
  dnd: `var(--color-status-dnd)`,
  offline: `var(--color-status-offline)`
};

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  online: `Online`,
  idle: `Idle`,
  dnd: `Do Not Disturb`,
  offline: `Offline`
};

/**
 * The status symbol cutout, drawn as an SVG mask so the dot's fill color shows
 * through. Online = full circle; idle = crescent (moon); dnd = horizontal bar
 * (minus); offline = hollow ring.
 */
const SYMBOL: Record<DisplayStatus, React.ReactNode> = {
  online: null,
  idle: <circle cx="3" cy="3" r="4.5" fill="var(--color-section)" />,
  dnd: (
    <rect
      x="2.5"
      y="4.5"
      width="5"
      height="2"
      rx="1"
      fill="var(--color-section)"
    />
  ),
  offline: <circle cx="5" cy="5" r="2.5" fill="var(--color-section)" />
};

export const StatusDot = ({
  status,
  size = 10
}: {
  status: DisplayStatus;
  size?: number;
}): React.JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 10 10"
    role="img"
    aria-label={STATUS_LABEL[status]}
  >
    <circle cx="5" cy="5" r="5" fill={STATUS_COLOR[status]} />
    {SYMBOL[status]}
  </svg>
);
