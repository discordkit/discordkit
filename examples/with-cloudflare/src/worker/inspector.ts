import { DurableObject } from "cloudflare:workers";
import {
  EVENT_INTENTS,
  PRIVILEGED_INTENTS,
  createConnection,
  type GatewayConnection,
  type GatewayIntentName
} from "@discordkit/gateway";
import type {
  ClientMessage,
  EventWarning,
  InspectedEvent,
  InspectorStatus,
  ServerMessage
} from "../shared/protocol.js";

export interface Env {
  INSPECTOR: DurableObjectNamespace<GatewayInspector>;
  ASSETS: Fetcher;
  /** Overrides the Gateway URL. Used by tests to point at a mock. */
  GATEWAY_URL?: string;
}

/**
 * How many events to keep. A busy guild produces a lot of TYPING_START, and the
 * point of the buffer is only so a viewer joining mid-session (or reloading)
 * sees recent history — not to be a durable log.
 */
const BUFFER_SIZE = 500;

/**
 * Holds the single outbound Gateway connection and fans events out to every
 * connected browser.
 *
 * A Durable Object is the only serverless primitive offering what the Gateway
 * needs: a persistent, singleton, outbound WebSocket. Discord permits one
 * session per bot, so this is deliberately ONE object, not one per viewer.
 *
 * Two things about the lifecycle are worth knowing, because they drive the
 * design and the cost:
 *
 * - Browser sockets use `ctx.acceptWebSocket()` (the Hibernation API), which is
 *   Cloudflare's mandated pattern inside a DO.
 * - The DO still cannot actually hibernate while Discord is connected:
 *   hibernation requires the DO to be only a WebSocket *server*, and outbound
 *   sockets (plus the heartbeat timer) block it. An active outbound socket does
 *   keep the DO alive for up to 15 minutes at a time, which is why the Gateway
 *   connection survives without inbound traffic — but it also bills for that
 *   whole time. Hence connect-on-demand: the socket opens when someone is
 *   watching and closes when the last viewer leaves.
 */
export class GatewayInspector extends DurableObject<Env> {
  #connection: GatewayConnection | null = null;
  #events: InspectedEvent[] = [];
  #unsubscribe: (() => void) | null = null;
  #nextId = 1;
  #intents: readonly GatewayIntentName[] = [];
  #connectedAt: number | null = null;

  override fetch(request: Request): Response {
    if (request.headers.get(`Upgrade`) !== `websocket`) {
      return new Response(`Expected a WebSocket upgrade`, { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    // `acceptWebSocket` rather than `server.accept()`: inside a Durable Object
    // this is the required pattern, and it's what lets the runtime manage the
    // connection rather than pinning it to this isolate's event listeners.
    this.ctx.acceptWebSocket(server);

    // Hand a new viewer the current state plus recent history, so opening the
    // page mid-session isn't an empty screen.
    this.#send(server, { type: `status`, status: this.#status() });
    this.#send(server, { type: `backlog`, events: this.#events });

    return new Response(null, { status: 101, webSocket: client });
  }

  override webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): void {
    if (typeof raw !== `string`) return;

    let message: ClientMessage;
    try {
      message = JSON.parse(raw) as ClientMessage;
    } catch {
      this.#send(ws, { type: `error`, message: `Malformed message.` });
      return;
    }

    switch (message.type) {
      case `connect`:
        this.#connect(message.token, message.intents);
        break;
      case `disconnect`:
        this.#disconnect();
        break;
      case `clear`:
        this.#events = [];
        this.#broadcast({ type: `status`, status: this.#status() });
        break;
    }
  }

  override webSocketClose(): void {
    // The last viewer leaving closes the Gateway socket. Cost is proportional
    // to watch time, and an unwatched inspector holding a Discord session is
    // pure waste — Discord allows only one, and daily session starts are
    // limited.
    if (this.ctx.getWebSockets().length === 0) this.#disconnect();
  }

  #connect(token: string, intents: readonly GatewayIntentName[]): void {
    if (this.#connection) return;
    if (token.trim() === ``) {
      this.#broadcast({
        type: `error`,
        message: `A bot token is required to open a Gateway connection.`
      });
      return;
    }

    this.#intents = intents;
    const connection = createConnection({
      token,
      intents,
      ...(this.env.GATEWAY_URL === undefined
        ? {}
        : { url: this.env.GATEWAY_URL })
    });
    this.#connection = connection;
    this.#connectedAt = Date.now();

    const offState = connection.onStateChange(() => {
      this.#broadcast({ type: `status`, status: this.#status() });
    });
    // Subscribe to the raw dispatch stream rather than typed per-event
    // handlers: an inspector wants EVERY event, including ones this package
    // doesn't have a typed module for yet.
    const offDispatch = connection.onDispatch((event) => {
      this.#record(event.type, `dispatch`, event.data);
    });
    this.#unsubscribe = (): void => {
      offState();
      offDispatch();
    };

    connection.connect();
    this.#broadcast({ type: `status`, status: this.#status() });
  }

  #disconnect(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    this.#connection?.close();
    this.#connection = null;
    this.#connectedAt = null;
    this.#broadcast({ type: `status`, status: this.#status() });
  }

  #record(
    type: string,
    category: `dispatch` | `lifecycle`,
    data: unknown
  ): void {
    const event: InspectedEvent = {
      id: this.#nextId++,
      type,
      category,
      at: Date.now(),
      seq: null,
      data,
      intents: intentsForEvent(type),
      warnings: detectWarnings(type, data, this.#intents)
    };

    this.#events.push(event);
    if (this.#events.length > BUFFER_SIZE) this.#events.shift();

    this.#broadcast({ type: `event`, event });
  }

  #status(): InspectorStatus {
    return {
      state: this.#connection?.state ?? `idle`,
      sessionId: this.#connection?.sessionId ?? null,
      intents: this.#intents,
      missingIntents: PRIVILEGED_INTENTS.filter(
        (intent) => !this.#intents.includes(intent)
      ),
      eventCount: this.#events.length,
      connectedAt: this.#connectedAt
    };
  }

  #send(ws: WebSocket, message: ServerMessage): void {
    ws.send(JSON.stringify(message));
  }

  #broadcast(message: ServerMessage): void {
    const payload = JSON.stringify(message);
    for (const ws of this.ctx.getWebSockets()) ws.send(payload);
  }

  /** Intents this app would need, for the spike's assertions. */
  declaredIntents(): readonly GatewayIntentName[] {
    return this.#intents;
  }

  /** Current connection state, for the spike's assertions. */
  status(): InspectorStatus {
    return this.#status();
  }
}

/** The intents that gate a given wire event, from the generated map. */
const intentsForEvent = (type: string): readonly GatewayIntentName[] =>
  (EVENT_INTENTS as Record<string, readonly GatewayIntentName[]>)[type] ?? [];

/**
 * Flag the Gateway's most notorious silent failure.
 *
 * Without the privileged `MESSAGE_CONTENT` intent a bot still receives every
 * `MESSAGE_CREATE` — but `content`, `embeds`, `attachments`, `components` and
 * `poll` arrive empty. There is no error and no log line, so command matching
 * just silently never fires. Naming it here is the whole reason this tool
 * beats `console.log`.
 */
const detectWarnings = (
  type: string,
  data: unknown,
  intents: readonly GatewayIntentName[]
): EventWarning[] => {
  if (type !== `MESSAGE_CREATE` && type !== `MESSAGE_UPDATE`) return [];
  if (intents.includes(`MESSAGE_CONTENT`)) return [];
  if (typeof data !== `object` || data === null) return [];

  const { content } = data as { content?: unknown };
  if (content !== ``) return [];

  return [
    {
      kind: `empty-content`,
      intent: `MESSAGE_CONTENT`,
      message: `content is empty because the privileged MESSAGE_CONTENT intent wasn't requested — the event still fires, so this fails silently in a real bot.`
    }
  ];
};
