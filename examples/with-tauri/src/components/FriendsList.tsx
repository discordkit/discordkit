import { useMemo } from "react";
import { Button } from "react-aria-components";
import type { SnapshotFrom } from "xstate";
import type { Relationship } from "@discordkit/tauri/renderer/relationships";
import { Section } from "./Section.js";
import { ConnectionPoint } from "./ConnectionPoint.js";
import { FriendsSkeleton } from "./FriendsSkeleton.js";
import { sectionFriends, isOnline } from "../sections.js";
import type { StudioOptions } from "../studio.js";
import type { discordMachine, ConnectError } from "../machine.js";

type State = SnapshotFrom<typeof discordMachine>;

/**
 * The assembled unified friends list (Figma "Preview"). What it shows is driven by the connection machine: a spinner while booting, the connect point when disconnected, an actionable panel for each connect-failure mode, a skeleton while relationships load, then the live sections (or a clear empty/error).
 */
export const FriendsList = ({
  state,
  friends,
  options,
  onConnect,
  onRetry
}: {
  state: State;
  friends: Relationship[];
  options: StudioOptions;
  onConnect: () => void;
  onRetry: () => void;
}): React.JSX.Element => {
  const sections = useMemo(() => {
    // Pick the first N online friends to simulate as "in game" for the preview.
    const inGameIds = new Set(
      friends
        .filter((r) => isOnline(r.user?.status))
        .slice(0, options.simulatedInGame)
        .map((r) => String(r.userId))
    );
    return sectionFriends(friends, {
      gameTitle: options.gameTitle,
      inGameIds
    });
  }, [friends, options.simulatedInGame, options.gameTitle]);

  const connected = state.matches(`connected`);
  // Show the connect footer only on the plain disconnected/connecting screens —
  // the error panel and the boot spinner own their own area, no footer needed.
  const showConnectionPoint =
    options.showConnectionPoint &&
    (state.matches(`disconnected`) || state.matches(`connecting`));

  return (
    <div
      data-testid="friends-list"
      className="flex w-80 flex-col overflow-hidden rounded-module border border-edge-soft bg-canvas"
    >
      <div className="flex flex-1 flex-col gap-2 p-2">
        {state.matches(`initializing`) ? (
          <FriendsSkeleton label="Starting…" />
        ) : state.matches(`connectError`) && state.context.error ? (
          <ConnectErrorPanel error={state.context.error} onRetry={onRetry} />
        ) : !connected ? (
          // Disconnected (initial or after logout) — never show stale friends.
          <ListMessage>
            Connect your Discord account to see your friends.
          </ListMessage>
        ) : state.matches({ connected: `loading` }) ? (
          <FriendsSkeleton />
        ) : state.context.friendsError ? (
          <ListMessage>{state.context.friendsError}</ListMessage>
        ) : sections.every((s) => s.members.length === 0) ? (
          <ListMessage>No friends to show yet.</ListMessage>
        ) : (
          sections.map((section) => (
            <Section key={section.key} section={section} options={options} />
          ))
        )}
      </div>
      {showConnectionPoint ? (
        <ConnectionPoint
          onConnect={onConnect}
          busy={state.matches(`connecting`)}
        />
      ) : null}
    </div>
  );
};

const ListMessage = ({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element => (
  <p className="px-3 py-10 text-center text-sm text-text-muted">{children}</p>
);

/** Title + body + Retry for each connect-failure mode. */
const ConnectErrorPanel = ({
  error,
  onRetry
}: {
  error: ConnectError;
  onRetry: () => void;
}): React.JSX.Element => {
  const { title, body, retryLabel } = errorCopy(error);
  return (
    <div className="flex flex-col gap-3 p-4">
      <div>
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <p className="mt-1 text-xs text-text-muted">{body}</p>
      </div>
      {error.kind === `sdkMissing` && error.stderr?.trim() ? (
        <pre className="max-h-40 overflow-auto rounded-md bg-fill p-2 text-[11px] leading-snug text-text-muted">
          {error.stderr.trim()}
        </pre>
      ) : null}
      <Button
        onPress={onRetry}
        className="self-start rounded-md bg-elevated px-3 py-1.5 text-sm font-medium text-text outline-none transition-colors hover:bg-elevated-hover focus-visible:ring-2 focus-visible:ring-brand"
      >
        {retryLabel}
      </Button>
    </div>
  );
};

/** Per-kind copy for the connect-error panel. */
const errorCopy = (
  error: ConnectError
): { title: string; body: string; retryLabel: string } => {
  switch (error.kind) {
    case `declined`:
      return {
        title: `Connection cancelled`,
        body: `You dismissed the Discord authorization prompt. Try again when you’re ready.`,
        retryLabel: `Connect`
      };
    case `discordDown`:
      return {
        title: `Couldn't reach Discord`,
        body: `The Discord desktop app didn’t respond. Make sure it’s running, then try again.`,
        retryLabel: `Try again`
      };
    case `redirectUri`:
      return {
        title: `Redirect URI not configured`,
        body: `Authorizing in the browser (Discord desktop wasn’t running) needs http://127.0.0.1/callback registered under OAuth2 → Redirects in your app’s Developer Portal settings.`,
        retryLabel: `Try again`
      };
    case `sdkMissing`:
      return {
        title: `Couldn't start the Discord SDK`,
        body: `The sidecar exited before it could connect. Make sure you’ve downloaded the Discord Social SDK and set DISCORD_SDK_PATH (see the README), then retry.`,
        retryLabel: `Retry`
      };
    case `failed`:
      return {
        title: `Couldn't connect`,
        body: error.message,
        retryLabel: `Try again`
      };
  }
};
