import { useCallback, useEffect, useRef, useState } from "react";
import type { GatewayIntentName } from "@discordkit/gateway";
import type {
  ClientMessage,
  InspectedEvent,
  InspectorStatus,
  ServerMessage
} from "../shared/protocol.js";

const IDLE_STATUS: InspectorStatus = {
  state: `idle`,
  sessionId: null,
  intents: [],
  missingIntents: [],
  eventCount: 0,
  tokenFromEnv: false,
  // Recording is on by default: the inspector's job is to capture, and a tool
  // that silently starts paused looks broken.
  recording: true,
  recordFilter: null,
  seenTypes: [],
  connectedAt: null
};

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
 * Owns the browser's WebSocket to the Worker.
 *
 * Note this is a *second* WebSocket, distinct from the Gateway one: browser ↔
 * Worker ↔ Durable Object ↔ Discord. The DO is the only thing that talks to
 * Discord, so the bot token is sent over this socket and never stored client
 * side.
 */
export const useInspector = (): Inspector => {
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<InspectorStatus>(IDLE_STATUS);
  const [events, setEvents] = useState<InspectedEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === `https:` ? `wss:` : `ws:`;
    const socket = new WebSocket(
      `${protocol}//${window.location.host}/api/stream`
    );
    socketRef.current = socket;

    socket.addEventListener(`open`, () => {
      setOnline(true);
    });
    socket.addEventListener(`close`, () => {
      setOnline(false);
    });
    socket.addEventListener(`message`, (event: MessageEvent<string>) => {
      const message = JSON.parse(event.data) as ServerMessage;
      switch (message.type) {
        case `status`:
          setStatus(message.status);
          break;
        case `event`:
          setEvents((current) => [...current, message.event]);
          break;
        case `backlog`:
          setEvents([...message.events]);
          break;
        case `error`:
          setError(message.message);
          break;
      }
    });

    return (): void => {
      // StrictMode mounts effects twice in development, so this cleanup can run
      // while the socket is still CONNECTING. Calling close() then is legal but
      // logs "WebSocket is closed before the connection is established" — wait
      // for `open` and close after, so the teardown is clean either way.
      if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener(`open`, () => {
          socket.close();
        });
      } else {
        socket.close();
      }
      socketRef.current = null;
    };
  }, []);

  const send = useCallback((message: ClientMessage): void => {
    const socket = socketRef.current;
    if (socket?.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(message));
  }, []);

  const connect = useCallback(
    (token: string, intents: readonly GatewayIntentName[]): void => {
      setError(null);
      send({ type: `connect`, token, intents });
    },
    [send]
  );

  const reconnect = useCallback(
    (intents: readonly GatewayIntentName[]): void => {
      setError(null);
      send({ type: `reconnect`, intents });
    },
    [send]
  );

  const disconnect = useCallback((): void => {
    send({ type: `disconnect` });
  }, [send]);

  const setRecording = useCallback(
    (recording: boolean): void => {
      send({ type: `record`, recording });
    },
    [send]
  );

  const setRecordFilter = useCallback(
    (types: readonly string[] | null): void => {
      send({ type: `recordFilter`, types });
    },
    [send]
  );

  const clear = useCallback((): void => {
    setEvents([]);
    send({ type: `clear` });
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
