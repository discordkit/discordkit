import { useMemo, useState } from "react";
import { useMachine } from "@xstate/react";
import { isOnline } from "./sections.js";
import { discordMachine } from "./machine.js";
import { DEFAULT_OPTIONS, type StudioOptions } from "./studio.js";
import { ControlsPanel } from "./components/ControlsPanel.js";
import { FriendsList } from "./components/FriendsList.js";

/**
 * Friends List Studio — the Tauri example. A live, tunable unified friends list built on the developer's REAL Discord relationships, rendered against Discord's design guidelines. Adjust the Studio controls on the left; the list on the right updates instantly — the social-graph counterpart to with-electron's Rich Presence Visualizer.
 *
 * The whole connection + friends lifecycle (booting, silent resume, the connect flow with its cancel / Discord-not-running failure modes, loading, logout) is modelled in {@link discordMachine}; this component just renders the current machine state and sends events.
 */
export const App = (): React.JSX.Element => {
  const [state, send] = useMachine(discordMachine);
  const [options, setOptions] = useState<StudioOptions>(DEFAULT_OPTIONS);

  const connected = state.matches(`connected`);
  const { friends } = state.context;
  const onlineCount = useMemo(
    () => friends.filter((r) => isOnline(r.user?.status)).length,
    [friends]
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">
            Friends List Studio
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Tune a unified friends list against Discord’s design guidelines —
            your real friends, live.
          </p>
        </div>
        <ConnectionStatus
          label={statusLabel(state.value)}
          onRefresh={connected ? () => send({ type: `REFRESH` }) : undefined}
          refreshing={state.matches({ connected: `loading` })}
          onLogout={connected ? () => send({ type: `LOGOUT` }) : undefined}
        />
      </header>

      <div className="flex flex-wrap items-start gap-6">
        <ControlsPanel
          options={options}
          onChange={setOptions}
          maxInGame={onlineCount}
        />
        <FriendsList
          state={state}
          friends={friends}
          options={options}
          onConnect={() => send({ type: `CONNECT` })}
          onRetry={() => send({ type: `RETRY` })}
        />
      </div>
    </main>
  );
};

/** A short, human label for the current machine state (shown in the status pill). */
const statusLabel = (value: unknown): string => {
  if (value === `initializing`) return `starting…`;
  if (value === `connecting`) return `connecting…`;
  if (value === `connectError`) return `disconnected`;
  if (value === `loggingOut`) return `logging out…`;
  if (value === `disconnected`) return `disconnected`;
  // `connected` is an object value ({ connected: 'loading' | 'loaded' }).
  if (typeof value === `object` && value && `connected` in value)
    return `ready`;
  return `…`;
};

/** A small status pill + refresh / logout, shown by App's header. */
const ConnectionStatus = ({
  label,
  onRefresh,
  refreshing,
  onLogout
}: {
  label: string;
  /** Provided only when connected. */
  onRefresh?: () => void;
  refreshing: boolean;
  /** Provided only when connected. */
  onLogout?: () => void;
}): React.JSX.Element => (
  <div className="flex items-center gap-3 text-sm">
    <span
      data-testid="connection-status"
      className="rounded-full bg-fill px-3 py-1 text-text-muted"
    >
      {label}
    </span>
    {onRefresh ? (
      <button
        type="button"
        data-testid="refresh"
        onClick={onRefresh}
        disabled={refreshing}
        className="rounded-md bg-elevated px-3 py-1 font-medium text-text outline-none transition-colors hover:bg-elevated-hover disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-brand"
      >
        {refreshing ? `Refreshing…` : `Refresh`}
      </button>
    ) : null}
    {onLogout ? (
      <button
        type="button"
        onClick={onLogout}
        data-testid="logout"
        className="rounded-md bg-elevated px-3 py-1 font-medium text-text-muted outline-none transition-colors hover:bg-elevated-hover focus-visible:ring-2 focus-visible:ring-brand"
      >
        Log out
      </button>
    ) : null}
  </div>
);
