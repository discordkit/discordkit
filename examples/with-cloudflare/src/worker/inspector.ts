import { DurableObject } from "cloudflare:workers";
import {
  EVENT_INTENTS,
  GatewayConnection,
  PRIVILEGED_INTENTS,
  type GatewayIntentName
} from "@discordkit/gateway";
import type {
  ApplicationInfo,
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
 * How long the Gateway session survives with no viewers attached.
 *
 * Long enough to outlast a page refresh (sub-second in practice), short enough
 * that a closed tab doesn't hold a Discord session — and the session start it
 * cost — for meaningfully longer than the tab was open.
 */
const IDLE_GRACE_MS = 30_000;

/**
 * Application flag bits that mean "this privileged intent is enabled".
 *
 * Each intent has two bits: the full grant and a `_LIMITED` variant, which
 * unverified bots (under 100 guilds) get automatically. Both mean the intent
 * will be accepted in IDENTIFY, so both count as enabled — treating only the
 * full grant as valid would warn about a perfectly working setup.
 */
const PRIVILEGED_FLAGS: Record<string, GatewayIntentName> = {
  [String(1 << 12)]: `GUILD_PRESENCES`, // GATEWAY_PRESENCE
  [String(1 << 13)]: `GUILD_PRESENCES`, // GATEWAY_PRESENCE_LIMITED
  [String(1 << 14)]: `GUILD_MEMBERS`, // GATEWAY_GUILD_MEMBERS
  [String(1 << 15)]: `GUILD_MEMBERS`, // GATEWAY_GUILD_MEMBERS_LIMITED
  [String(1 << 18)]: `MESSAGE_CONTENT`, // GATEWAY_MESSAGE_CONTENT
  [String(1 << 19)]: `MESSAGE_CONTENT` // GATEWAY_MESSAGE_CONTENT_LIMITED
};

/** Which privileged intents a bot's application flags actually grant. */
const privilegedFrom = (flags: number): GatewayIntentName[] => [
  ...new Set(
    Object.entries(PRIVILEGED_FLAGS)
      .filter(([bit]) => (flags & Number(bit)) !== 0)
      .map(([, intent]) => intent)
  )
];

/**
 * Fetch the bot's application over REST.
 *
 * A direct `fetch` rather than `@discordkit/client`'s `getCurrentApplication`,
 * because that fetcher authenticates through the module-global `discord`
 * session. Module globals are per-ISOLATE in Workers, and one isolate can host
 * several Durable Objects — so setting a token there would leak one
 * inspector's credentials into another's requests. Passing the header
 * explicitly keeps the token scoped to this call.
 *
 * Failures are swallowed: this is an enhancement (a deep link and a warning),
 * and a bot with no `applications.commands` reach or a transient 5xx should
 * not block connecting.
 */
const fetchApplication = async (
  token: string
): Promise<ApplicationInfo | null> => {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/applications/@me`,
      {
        headers: { Authorization: `Bot ${token}` }
      }
    );
    if (!response.ok) return null;
    const app = (await response.json()) as {
      id?: string;
      name?: string;
      flags?: number;
    };
    if (typeof app.id !== `string`) return null;
    return {
      id: app.id,
      name: app.name ?? `Unknown application`,
      enabledPrivileged: privilegedFrom(app.flags ?? 0)
    };
  } catch {
    return null;
  }
};

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
  /** The bot's application, fetched once per token on connect. */
  #application: ApplicationInfo | null = null;
  /**
   * Connection timers run on Durable Object alarms rather than `setTimeout`.
   * A DO's JS timers die with its isolate, so an evicted object would stop
   * heartbeating and silently lose the Discord session; an alarm survives
   * eviction and wakes the object back up.
   */
  #scheduler = alarmScheduler(this.ctx);
  /**
   * Pending "last viewer left" timer, or `null`.
   *
   * A page refresh closes the browser socket and reopens it about a second
   * later. Dropping the Gateway session the instant the last viewer leaves
   * therefore punished a refresh exactly as hard as closing the tab: you came
   * back to a disconnected inspector and had to spend another session start.
   * The grace period keeps the session alive just long enough for a reload to
   * reclaim it, while still releasing it when someone really has gone.
   */
  #idleTimer: unknown = null;

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

    // A viewer arrived, so cancel any pending teardown — this is the refresh
    // case the grace period exists for.
    if (this.#idleTimer !== null) {
      this.#scheduler.clearTimeout(this.#idleTimer);
      this.#idleTimer = null;
    }

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
      case `simulate`:
        // Synthetic traffic for driving the UI without a live Gateway. Goes
        // through the same `#record` path as real events, so what the timeline
        // renders is what it would render for Discord's own dispatches.
        this.#record(message.event, `dispatch`, {
          simulated: true,
          at: Date.now()
        });
        break;
      case `clear`:
        this.#events = [];
        this.#seenTypes.clear();
        this.#broadcast({ type: `status`, status: this.#status() });
        break;
    }
  }

  override webSocketClose(): void {
    // The last viewer leaving eventually closes the Gateway socket: an
    // unwatched inspector holding a Discord session is pure waste, and daily
    // session starts are limited. But it waits out a grace period first, so a
    // page refresh — which closes and reopens this socket a second apart —
    // reclaims the existing session instead of paying for a new one.
    if (this.ctx.getWebSockets().length === 0) {
      if (this.#idleTimer !== null)
        this.#scheduler.clearTimeout(this.#idleTimer);
      this.#idleTimer = this.#scheduler.setTimeout(() => {
        this.#idleTimer = null;
        // Re-check: a viewer may have arrived while the timer was pending.
        if (this.ctx.getWebSockets().length === 0) this.#disconnect();
      }, IDLE_GRACE_MS);
    }
  }

  #connect(token: string, intents: readonly GatewayIntentName[]): void {
    // A dead connection is still a non-null object, so testing for presence
    // alone wedges the inspector permanently: after any failed attempt (bad
    // token, 4014 disallowed intents, a dropped socket) `#connection` stays
    // set in state `closed`, and every later Connect silently returns. Only
    // an already-live connection should short-circuit; a spent one gets
    // cleared so the click can build a fresh one.
    if (this.#connection) {
      if (this.#connection.state !== `closed`) return;
      this.#disconnect();
    }
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

    const offState = connection.onStateChange((state) => {
      // Record the lifecycle transition as an event of its own, so the list
      // shows WHERE a session ended and the next began. Without it, a
      // reconnect looks like an unexplained gap in the stream — and a resumed
      // session looks identical to a fresh one.
      //
      // Only the settled states: `connecting`/`identifying` are steps on the
      // way to `ready`, and recording each would bury the dispatch events the
      // list exists to show.
      if (state === `ready` || state === `closed` || state === `resuming`) {
        this.#record(state.toUpperCase(), `lifecycle`, {
          state,
          sessionId: connection.sessionId,
          at: Date.now()
        });
      }
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

    // Fetch the application alongside the Gateway handshake rather than before
    // it: it only enriches the UI, so making the connection wait on a REST
    // round-trip would delay the thing you actually came for.
    void (async (): Promise<void> => {
      const application = await fetchApplication(resolved);
      if (application === null) return;
      this.#application = application;
      this.#broadcast({ type: `status`, status: this.#status() });
    })();
  }

  #disconnect(): void {
    // Record the marker BEFORE unsubscribing. `close()` drives the connection
    // to `closed`, but the state listener is what turns that into a marker —
    // detaching first meant a deliberate disconnect left no trace in the log,
    // which is why only "connected" separators were showing up.
    //
    // Labelled distinctly from a drop: "you disconnected" and "the connection
    // died" are different stories, and the log should not conflate them.
    if (this.#connection !== null) {
      this.#record(`DISCONNECTED`, `lifecycle`, {
        state: `closed`,
        sessionId: this.#connection.sessionId,
        deliberate: true,
        at: Date.now()
      });
    }
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
    // Lifecycle markers bypass recording rules entirely: they explain gaps in
    // the stream, so suppressing them via a pause or a type allowlist would
    // hide exactly the context needed to read what remains. They are also not
    // offered in the type filter, for the same reason.
    if (category === `lifecycle`) {
      this.#push({ type, category, data });
      return;
    }

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

    this.#push({ type, category, data });
  }

  /** Append to the buffer and fan out. Shared by both record paths. */
  #push({
    type,
    category,
    data
  }: {
    type: string;
    category: `dispatch` | `lifecycle`;
    data: unknown;
  }): void {
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
      application: this.#application,
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

  /**
   * Close the Gateway connection without clearing it, for tests.
   *
   * Reproduces the post-failure state Discord leaves behind — a connection
   * object that exists but is spent. `disconnect` nulls the field, so it
   * cannot exercise the guard that this state used to defeat.
   */
  forceClose(): void {
    this.#connection?.close();
  }

  /**
   * Run the last-viewer-left path, for tests.
   *
   * The pool has no browser to close a real socket, and `getWebSockets()` is
   * empty in these tests anyway — so this drives the same branch `webSocketClose`
   * takes when the final viewer disconnects.
   */
  simulateViewerClose(): void {
    this.webSocketClose();
  }

  /** Record a lifecycle marker directly, for tests. */
  simulateLifecycle(type: string): void {
    this.#record(type, `lifecycle`, { simulated: true });
  }

  /** Run the viewer-arrived path (cancels a pending teardown), for tests. */
  simulateViewerOpen(): void {
    if (this.#idleTimer !== null) {
      this.#scheduler.clearTimeout(this.#idleTimer);
      this.#idleTimer = null;
    }
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
