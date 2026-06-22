import { Button } from "react-aria-components";
import { DiscordBadge } from "./DiscordBadge.js";

/**
 * The friends-list connection point (Figma "Connection Point"): the persistent
 * call-to-action shown until the player connects their Discord account. Per the
 * `connection-points` guideline it uses the blurple button styling and the
 * standard copy. Sits as the list footer; disappears once connected.
 */
export const ConnectionPoint = ({
  onConnect,
  busy
}: {
  onConnect: () => void;
  busy: boolean;
}): React.JSX.Element => (
  <div className="border-t border-edge-soft p-3">
    <Button
      onPress={onConnect}
      isDisabled={busy}
      data-testid="connect-discord"
      className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white outline-none transition-colors hover:bg-brand-hover pressed:bg-brand-active disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-brand"
    >
      <span>{busy ? `Connecting…` : `Connect to`}</span>
      {!busy ? (
        <span className="flex items-center gap-1">
          <DiscordBadge />
          <span>Discord</span>
        </span>
      ) : null}
    </Button>
  </div>
);
