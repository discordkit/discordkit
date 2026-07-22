import { Gamepad2 } from "lucide-react";
import { dicebear } from "../samples.js";
import type { FormValues } from "../schema.js";

/**
 * A minimal Discord member-list-entry preview — how the presence appears to
 * others in a server member list: a circular avatar with an online dot, the
 * display name, and the status line whose text `statusDisplayType` drives (name →
 * the app name, state/details → that field). This is where the display type is
 * actually visible, so it complements the Full Profile card.
 *
 * Deliberately minimal: profile customizations (avatar decorations, nameplates,
 * name styles) are out of scope for now — a later polish PR can add them. The
 * avatar is a DiceBear mock and the display name is a placeholder, since this
 * presence-only demo has no authenticated user to read a real profile from.
 */

// The `name` display type surfaces the registered Discord application's name,
// which this presence-only demo can't read — so stand in a placeholder.
const APP_NAME = `Your App`;

export const StatusPreview = ({
  values
}: {
  values: FormValues;
}): React.JSX.Element => {
  const a = values.activity;
  const online = values.enabled;
  const displayType = a.statusDisplayType; // always set; `name` is the default
  const state = a.state.on ? a.state.value : ``;
  const details = a.details.on ? a.details.value : ``;

  // The status line shows the selected field; an empty selection falls back to
  // the app name (as Discord does), and `name` shows the app name outright.
  const statusText =
    displayType === `state`
      ? state || APP_NAME
      : displayType === `details`
        ? details || APP_NAME
        : APP_NAME;

  return (
    <div className="rounded-md bg-canvas p-2">
      <div className="flex items-center gap-3 rounded px-2 py-1.5">
        <div className="relative shrink-0">
          <img
            src={dicebear(`personas`, `discordkit`)}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full bg-surface object-cover"
          />
          {/* Online/offline dot, ring-cut out of the row background. */}
          <span
            className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-[3px] ring-canvas"
            style={{ backgroundColor: online ? `#23a55a` : `#80848e` }}
            role="img"
            aria-label={online ? `Online` : `Offline`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">You</p>
          {online ? (
            <p className="flex items-center gap-1 text-xs text-text-muted">
              <Gamepad2
                size={13}
                className="shrink-0"
                style={{ color: `#23a55a` }}
              />
              <span className="truncate">{statusText}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
