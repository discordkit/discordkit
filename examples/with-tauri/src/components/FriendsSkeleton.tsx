/**
 * A loading placeholder that mirrors the friends-list shape (a section header + rows of avatar/name/status), shown while the bridge boots or relationships load. Pulsing skeletons read as "content is coming" far better than a bare spinner and avoid layout shift when the real list lands.
 */
export const FriendsSkeleton = ({
  rows = 6,
  label
}: {
  rows?: number;
  /** Optional accessible/status label (e.g. "Starting…"). */
  label?: string;
}): React.JSX.Element => (
  <div
    className="flex flex-col gap-2 motion-safe:animate-pulse"
    role="status"
    aria-label={label ?? `Loading your friends…`}
  >
    {/* Section header placeholder. */}
    <div className="h-9 rounded-md bg-section" />
    {/* Row placeholders. */}
    <div className="flex flex-col gap-0.5 p-1">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-1.5">
          <div className="size-9 shrink-0 rounded-md bg-fill" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="h-3 w-24 rounded bg-fill" />
            <div className="h-2.5 w-16 rounded bg-fill" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
