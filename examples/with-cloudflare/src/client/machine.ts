/* eslint-disable @typescript-eslint/explicit-function-return-type --
   The XState machine config is dense with inline guard/action/params arrows whose
   return types the framework infers; annotating each would add noise without value. */
import { setup, assign, fromCallback, sendTo } from "xstate";
import type {
  ClientMessage,
  InspectedEvent,
  InspectorStatus,
  ServerMessage
} from "../shared/protocol.js";

/**
 * The browser↔Worker socket lifecycle as a state machine.
 *
 * This replaces a `useEffect` that opened the socket once with no reconnect,
 * which had a real race: React StrictMode mounts effects twice in development,
 * so two sockets were created and the cleanup for the first could close the
 * second — leaving `online: false` forever with no way back. The symptom was a
 * permanently disabled Connect button, but only sometimes, because which
 * socket survived depended on whether the first reached OPEN before the
 * cleanup ran.
 *
 * Modelling it explicitly fixes that class of bug rather than the instance:
 * exactly one socket actor is alive per machine, its teardown is the actor's
 * own, and every disconnect has a defined path back (`reconnecting` with
 * backoff) instead of falling into an unrecoverable state.
 *
 * Note this is the socket to our own Worker, NOT the Discord Gateway. The
 * Gateway connection lives in the Durable Object and is reported through
 * `status` messages; this machine only cares about whether the browser can
 * talk to the Worker at all.
 */

/** Bounds for the reconnect backoff, in ms. */
const BACKOFF_MIN = 500;
const BACKOFF_MAX = 10_000;

export const backoffDelay = (attempts: number): number =>
  Math.min(BACKOFF_MIN * 2 ** attempts, BACKOFF_MAX);

const IDLE_STATUS: InspectorStatus = {
  state: `idle`,
  sessionId: null,
  intents: [],
  missingIntents: [],
  eventCount: 0,
  tokenFromEnv: false,
  recording: true,
  recordFilter: null,
  seenTypes: [],
  application: null,
  connectedAt: null
};

interface Context {
  status: InspectorStatus;
  events: InspectedEvent[];
  error: string | null;
  /** Consecutive failed connections, for the reconnect backoff. */
  attempts: number;
  /** Queued while the socket is down, so a click is never silently dropped. */
  pending: ClientMessage[];
}

type Events =
  | { type: `OPENED` }
  | { type: `CLOSED` }
  | { type: `MESSAGE`; message: ServerMessage }
  | { type: `SEND`; message: ClientMessage }
  /** Drain the queue built up while the socket was down. */
  | { type: `FLUSH`; messages: readonly ClientMessage[] }
  /** Empty the local buffer optimistically, alongside the server-side clear. */
  | { type: `CLEAR_LOCAL` }
  | { type: `RETRY` };

/**
 * The socket, as a long-lived actor.
 *
 * Owning the socket here rather than in an effect is the fix: the actor is
 * stopped exactly once, by the machine, so a duplicated React mount cannot
 * close a socket it does not own.
 */
const socket = fromCallback<Events>(({ sendBack, receive }) => {
  const protocol = window.location.protocol === `https:` ? `wss:` : `ws:`;
  const ws = new WebSocket(`${protocol}//${window.location.host}/api/stream`);

  const send = (message: ClientMessage): void => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
  };

  ws.addEventListener(`open`, () => {
    sendBack({ type: `OPENED` });
  });
  ws.addEventListener(`close`, () => {
    sendBack({ type: `CLOSED` });
  });
  // `error` always precedes `close`, which owns the reconnect decision — so
  // handling both would schedule two reconnects for one failure.
  ws.addEventListener(`message`, (event: MessageEvent<string>) => {
    try {
      sendBack({
        type: `MESSAGE`,
        message: JSON.parse(event.data) as ServerMessage
      });
    } catch {
      // A frame we can't parse isn't actionable.
    }
  });

  // Outbound messages arrive as events, so the component never touches the
  // socket directly.
  receive((event) => {
    if (event.type === `SEND`) send(event.message);
    if (event.type === `FLUSH`) for (const m of event.messages) send(m);
  });

  return (): void => {
    // Closing a CONNECTING socket is legal but logs a console warning, so wait
    // for `open` when the actor is stopped mid-handshake.
    if (ws.readyState === WebSocket.CONNECTING) {
      ws.addEventListener(`open`, () => {
        ws.close();
      });
    } else {
      ws.close();
    }
  };
});

export const inspectorMachine = setup({
  types: {
    // The `{} as T` form is XState v5's sanctioned way to declare context/event
    // types in `setup` (there's no runtime value, only the type).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    context: {} as Context,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    events: {} as Events
  },
  actors: { socket },
  delays: {
    reconnect: ({ context }) => backoffDelay(context.attempts)
  }
}).createMachine({
  id: `inspector`,
  context: {
    status: IDLE_STATUS,
    events: [],
    error: null,
    attempts: 0,
    pending: []
  },
  // Valid in every state: clearing the view shouldn't depend on the socket.
  on: {
    CLEAR_LOCAL: { actions: assign({ events: [] }) }
  },
  initial: `live`,
  states: {
    /**
     * Holds the socket actor across both `connecting` and `online`.
     *
     * The actor must outlive the handshake: invoking it on `connecting` alone
     * would tear the socket down the moment it opened. Nesting means exactly
     * one socket exists while we're in `live`, and leaving `live` (to
     * `reconnecting`) is what stops it — a single, explicit ownership rule
     * instead of effect-cleanup ordering.
     */
    live: {
      invoke: { src: `socket`, id: `socket` },
      initial: `connecting`,
      on: {
        CLOSED: `reconnecting`,
        MESSAGE: {
          actions: assign(({ context, event }) => {
            const { message } = event;
            switch (message.type) {
              case `status`:
                return { ...context, status: message.status };
              case `event`:
                return {
                  ...context,
                  events: [...context.events, message.event]
                };
              case `backlog`:
                return { ...context, events: [...message.events] };
              case `error`:
                return { ...context, error: message.message };
            }
          })
        }
      },
      states: {
        connecting: {
          on: {
            OPENED: {
              target: `online`,
              actions: assign({ attempts: 0, error: null })
            },
            // Buffer rather than drop: a click landing during the handshake
            // would otherwise vanish with no feedback.
            SEND: {
              actions: assign({
                pending: ({ context, event }) => [
                  ...context.pending,
                  event.message
                ]
              })
            }
          }
        },
        online: {
          // Flush anything queued while the socket was down.
          entry: [
            sendTo(`socket`, ({ context }) => ({
              type: `FLUSH` as const,
              messages: context.pending
            })),
            assign({ pending: [] })
          ],
          on: {
            SEND: { actions: sendTo(`socket`, ({ event }) => event) }
          }
        }
      }
    },

    reconnecting: {
      // Leaving `live` stopped the socket actor, so nothing lingers.
      entry: assign({ attempts: ({ context }) => context.attempts + 1 }),
      after: { reconnect: `live` },
      on: {
        // Manual retry skips the wait.
        RETRY: `live`,
        SEND: {
          actions: assign({
            pending: ({ context, event }) => [...context.pending, event.message]
          })
        }
      }
    }
  }
});
