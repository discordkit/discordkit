import { useCallback } from "react";
import { useMachine } from "@xstate/react";
import type { GatewayIntentName } from "@discordkit/gateway";
import type { InspectedEvent, InspectorStatus } from "../shared/protocol.js";
import { inspectorMachine } from "./machine.js";

export interface Inspector {
  status: InspectorStatus;
  events: InspectedEvent[];
  error: string | null;
  /** Whether the browser's own socket to the Worker is open. */
  online: boolean;
  connect: (token: string, intents: readonly GatewayIntentName[]) => void;
  /** Re-IDENTIFY with a new intent set. Costs a session start. */
  reconnect: (intents: readonly GatewayIntentName[]) => void;
  disconnect: () => void;
  /** Start/stop capturing without touching the Gateway connection. */
  setRecording: (recording: boolean) => void;
  /** Limit recorded types; `null` records everything. */
  setRecordFilter: (types: readonly string[] | null) => void;
  clear: () => void;
}

/**
 * Owns the browser's WebSocket to the Worker, via {@link inspectorMachine}.
 *
 * The socket lifecycle lives in the machine rather than an effect because it
 * genuinely is a state machine — connecting, open, dropped, waiting to retry —
 * and the previous effect-based version had no path back from "dropped",
 * which left the UI permanently offline after a dev-server restart or a
 * StrictMode double-mount.
 *
 * Note this is a *second* WebSocket, distinct from the Gateway one: browser ↔
 * Worker ↔ Durable Object ↔ Discord. The DO is the only thing that talks to
 * Discord, so the bot token is sent over this socket and never stored client
 * side.
 */
export const useInspector = (): Inspector => {
  const [state, send] = useMachine(inspectorMachine);
  const { status, events, error } = state.context;
  const online = state.matches({ live: `online` });

  const connect = useCallback(
    (token: string, intents: readonly GatewayIntentName[]): void => {
      send({ type: `SEND`, message: { type: `connect`, token, intents } });
    },
    [send]
  );

  const reconnect = useCallback(
    (intents: readonly GatewayIntentName[]): void => {
      send({ type: `SEND`, message: { type: `reconnect`, intents } });
    },
    [send]
  );

  const disconnect = useCallback((): void => {
    send({ type: `SEND`, message: { type: `disconnect` } });
  }, [send]);

  const setRecording = useCallback(
    (recording: boolean): void => {
      send({ type: `SEND`, message: { type: `record`, recording } });
    },
    [send]
  );

  const setRecordFilter = useCallback(
    (types: readonly string[] | null): void => {
      send({ type: `SEND`, message: { type: `recordFilter`, types } });
    },
    [send]
  );

  const clear = useCallback((): void => {
    // The DO echoes a fresh status after clearing, but its `backlog` is only
    // sent on connect — so drop the local list too rather than waiting for a
    // message that will not come.
    send({ type: `CLEAR_LOCAL` });
    send({ type: `SEND`, message: { type: `clear` } });
  }, [send]);

  return {
    status,
    events,
    error,
    online,
    connect,
    reconnect,
    disconnect,
    setRecording,
    setRecordFilter,
    clear
  };
};
