import { DurableObject } from "cloudflare:workers";
import {
  EVENT_INTENTS,
  GatewayConnection,
  PRIVILEGED_INTENTS,
  type GatewayIntentName
} from "@discordkit/gateway";
import type {
  ClientMessage,
  EventWarning,
  InspectedEvent,
  InspectorStatus,
  ServerMessage
} from "../shared/protocol.js";
import { alarmScheduler } from "./alarmScheduler.js";

export interface Env {
  INSPECTOR: DurableObjectNamespace<GatewayInspector>;
  ASSETS: Fetcher;
  /** Overrides the Gateway URL. Used by tests to point at a mock. */
  GATEWAY_URL?: string;
  /**
   * Optional bot token, so local dev doesn't require pasting one into the UI
   * every reload. Used only when the browser sends an empty token — the input
   * field still wins, which keeps the deployed app usable by someone who isn't
   * the operator.
   *
   * Server-side only. It is never sent to the browser: the client learns
   * whether one exists (see `tokenFromEnv` on the status) but never its value.
   */
  DISCORD_BOT_TOKEN?: string;
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
  /**
   * Whether events are being captured. Independent of the connection: pausing
   * leaves the Gateway session and its heartbeat untouched, so resuming costs
   * nothing. Making this a reconnect would spend a session start to change a
   * purely local decision.
   */
  #recording = true;
  /** Recorded-type allowlist; `null` records everything Discord sends. */
  #recordFilter: readonly string[] | null = null;
  /**
   * Every event type seen since connecting, so the UI can offer a filter list
   * built from real traffic rather than all 84 documented types.
   *
   * Tracked even while paused — otherwise pausing would hide the very types
   * you paused in order to go filter for.
   */
  #seenTypes = new Set<string>();
  /**
   * Connection timers run on Durable Object alarms rather than `setTimeout`.
   * A DO's JS timers die with its isolate, so an evicted object would stop
   * heartbeating and silently lose the Discord session; an alarm survives
   * eviction and wakes the object back up.
   */
  #scheduler = alarmScheduler(this.ctx);

  /** Drives every connection timer that has come due. */
  override async alarm(): Promise<void> {
    await this.#scheduler.onAlarm();
  }

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

    this.#handle(message);
  }

  /** Apply a decoded client message. Split out so tests can drive it. */
  #handle(message: ClientMessage): void {
    switch (message.type) {
      case `connect`:
        this.#connect(message.token, message.intents);
        break;
      case `reconnect`:
        // Intents are only accepted in IDENTIFY, so a change means a fresh
        // session. Tear down first so the old socket can't outlive it.
        this.#disconnect();
        // An empty token falls back to the env var inside #connect, which is
        // what makes this work when the browser never held one.
        this.#connect(``, message.intents);
        break;
      case `disconnect`:
        this.#disconnect();
        break;
      case `record`:
        this.#recording = message.recording;
        this.#broadcast({ type: `status`, status: this.#status() });
        break;
      case `recordFilter`:
        this.#recordFilter = message.types;
        this.#broadcast({ type: `status`, status: this.#status() });
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
    // Fall back to the configured token so local dev doesn't require pasting
    // one on every reload. The typed value wins when present, so a deployed
    // instance stays usable by someone who isn't the operator.
    const resolved =
      token.trim() === `` ? (this.env.DISCORD_BOT_TOKEN ?? ``) : token;
    if (resolved.trim() === ``) {
      this.#broadcast({
        type: `error`,
        message: `A bot token is required to open a Gateway connection. Enter one above, or set DISCORD_BOT_TOKEN in .env and restart the dev server.`
      });
      return;
    }

    this.#intents = intents;
    const connection = new GatewayConnection({
      token: resolved,
      intents,
      scheduler: this.#scheduler,
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
    // Track the type before any filtering, so the UI's filter list is built
    // from what Discord is actually sending — otherwise you could never
    // discover a type in order to add it to the allowlist.
    const isNewType = !this.#seenTypes.has(type);
    this.#seenTypes.add(type);

    if (!this.#recording) {
      // Still tell viewers about a newly-seen type while paused, so the filter
      // list keeps filling in. Only new types, to avoid a broadcast per event.
      if (isNewType)
        this.#broadcast({ type: `status`, status: this.#status() });
      return;
    }
    if (this.#recordFilter !== null && !this.#recordFilter.includes(type)) {
      if (isNewType)
        this.#broadcast({ type: `status`, status: this.#status() });
      return;
    }

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
      // Deliberately a boolean: the client needs to know a token is available
      // to enable Connect, and must never receive the token itself.
      tokenFromEnv: (this.env.DISCORD_BOT_TOKEN ?? ``).trim() !== ``,
      recording: this.#recording,
      recordFilter: this.#recordFilter,
      seenTypes: [...this.#seenTypes].sort(),
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

  /**
   * Drive the capture path directly, for tests.
   *
   * Exercises `#record` without a live Gateway socket, so the recording rules
   * (pause, allowlist, seen-type tracking) can be asserted without scripting a
   * whole Discord session.
   */
  simulateEvent(type: string, data: unknown = {}): void {
    this.#record(type, `dispatch`, data);
  }

  /** Apply a client message directly, for tests. */
  applyMessage(message: ClientMessage): void {
    this.#handle(message);
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
