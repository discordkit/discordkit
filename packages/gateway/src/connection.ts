import { GatewayCloseCode, isReconnectable } from "./types/GatewayCloseCode.js";
import { GatewayOpcode } from "./types/GatewayOpcode.js";
import type { GatewayPayload } from "./types/GatewayPayload.js";
import type { GatewayIntentName } from "./types/GatewayIntents.js";
import { intents as toIntentMask } from "./types/GatewayIntents.js";
import { globalScheduler, type Scheduler } from "./scheduler.js";
import { toSubscription, type Subscription } from "./subscription.js";

/** The Gateway API version this client speaks. */
export const GATEWAY_VERSION = 10;

/** Default Gateway URL, used when none is supplied via {@link ConnectionConfig.url}. */
export const DEFAULT_GATEWAY_URL = `wss://gateway.discord.gg/`;

/** How long to wait for a `HEARTBEAT_ACK` before treating the socket as zombied. */
const ACK_TIMEOUT_FACTOR = 1;

/**
 * Close codes we send. Discord treats 1000 as "this session is finished" and
 * invalidates it; anything in the 4000s leaves it resumable.
 */
const CLOSE_DONE = 1000;
const CLOSE_RESUMABLE = 4000;

/** Bounds for the reconnect backoff, in milliseconds. */
const BACKOFF_MIN = 1_000;
const BACKOFF_MAX = 30_000;

/**
 * Exponential backoff for the nth consecutive failed attempt, capped so a long
 * outage settles into steady retries rather than growing unboundedly.
 *
 * Pure, and exported, because the cap and growth curve are the parts worth
 * asserting directly — testing them through a live connection would mean
 * driving N reconnects to observe one arithmetic decision.
 */
export const backoffDelay = (attempts: number): number =>
  Math.min(BACKOFF_MIN * 2 ** attempts, BACKOFF_MAX);

/** What a socket close means for the session, independent of any connection. */
export interface CloseAction {
  /** Whether to attempt another connection at all. */
  reconnect: boolean;
  /**
   * Whether the session is dead and must be discarded. A discarded session
   * forces the next connection to IDENTIFY instead of RESUME, which costs one
   * of the limited daily session starts.
   */
  discardSession: boolean;
}

/**
 * Decide what a close code means: retry-and-resume, retry-fresh, or give up.
 *
 * Pure and exported so the close-code policy can be asserted per code rather
 * than by driving a socket into each state. This is the highest-consequence
 * branch in the client — getting it wrong either burns the daily session-start
 * limit in a reconnect loop or silently stops a bot forever.
 */
export const closeAction = (code: number): CloseAction => {
  // A fatal close (bad token, invalid or disallowed intents, invalid shard)
  // fails identically on every retry, so reconnecting is an infinite loop.
  if (!isReconnectable(code)) {
    return { reconnect: false, discardSession: true };
  }

  // A session survives only an unclean drop. 1000/1001 are the WHATWG "clean
  // close" codes — plain numbers, not GatewayCloseCode members.
  const cleanClose = code === 1000 || code === 1001;
  const sessionTimedOut: number = GatewayCloseCode.SESSION_TIMED_OUT;
  return {
    reconnect: true,
    discardSession: cleanClose || code === sessionTimedOut
  };
};

/**
 * Anything that knows which intents it needs — in practice an event handler
 * like `onMessageCreate`.
 *
 * Declared structurally rather than importing `EventSubscriber`, which would
 * make `connection.ts` depend on `events/dispatch.ts` and back again. Any object
 * exposing `intents` satisfies it, so a consumer can group their own.
 */
export interface IntentSource {
  readonly intents: readonly GatewayIntentName[];
}

/**
 * Flatten a mixed list of intent names and handlers into distinct names.
 *
 * Deduplicates, because several handlers commonly share an intent — the mask
 * would OR correctly either way, but the resolved list is user-visible.
 */
export const resolveIntents = (
  intents: ReadonlyArray<GatewayIntentName | IntentSource>
): GatewayIntentName[] => [
  ...new Set(
    intents.flatMap((entry) =>
      typeof entry === `string` ? [entry] : [...entry.intents]
    )
  )
];

export interface ConnectionConfig {
  /**
   * Bot token, **without** the `Bot ` prefix — it's added when identifying.
   */
  token: string;
  /**
   * Intents to request, combined into the bitfield sent with `IDENTIFY`.
   *
   * Accepts either intent names or the event handlers themselves — passing
   * handlers lets the connection derive the exact mask from what the bot
   * actually consumes, so it can't drift as handlers are added or removed:
   *
   * ```ts
   * new GatewayConnection({ token, intents: [onMessageCreate, onGuildCreate] });
   * ```
   */
  intents: ReadonlyArray<GatewayIntentName | IntentSource>;
  /**
   * Gateway URL. Defaults to {@link DEFAULT_GATEWAY_URL}; pass the `url` from
   * `getGatewayBot()` if you want Discord's per-app recommendation (and its
   * `shards` / `session_start_limit` alongside).
   */
  url?: string;
  /**
   * `[shardId, shardCount]`. Omit for a single-connection bot — the common case,
   * and the only one v0 targets.
   */
  shard?: readonly [number, number];
  /** Connection properties reported to Discord. */
  properties?: {
    os?: string;
    browser?: string;
    device?: string;
  };
  /**
   * How connection-lifecycle timers are scheduled. Defaults to the platform's
   * global timers, which is correct on every runtime that can host a Gateway
   * connection.
   *
   * Override it only when the host can schedule more durably than an in-memory
   * timer — a Cloudflare Durable Object loses its JS timers on eviction, so an
   * alarm-backed scheduler keeps the heartbeat alive across one. Also useful
   * for driving timing deterministically in tests.
   */
  scheduler?: Scheduler;
}

/** A dispatch event as delivered to subscribers: its name plus its `d` payload. */
export interface DispatchEvent {
  /** The wire event name from the payload's `t`, e.g. `MESSAGE_CREATE`. */
  type: string;
  /** The event's `d` payload. Narrowing is the caller's job. */
  data: unknown;
}

/** Lifecycle states a connection moves through. */
export type ConnectionState =
  | `idle`
  | `connecting`
  | `identifying`
  | `ready`
  | `resuming`
  | `closed`;

/**
 * The connection surface consumers depend on.
 *
 * Kept as a structural interface alongside {@link GatewayConnection} so callers
 * can accept "anything that behaves like a connection" — the event fan-out
 * takes one by parameter and tests substitute a fake, neither of which should
 * be forced to construct a real socket owner.
 *
 * Note it does **not** extend `Disposable`: a fake has nothing to dispose, and
 * requiring it would make every stub carry a no-op `[Symbol.dispose]`.
 */
export interface ConnectionLike {
  /** Current lifecycle state. */
  readonly state: ConnectionState;
  /** The active session id, once `READY` has been received. */
  readonly sessionId: string | null;
  /** Open the socket. Idempotent — a second call while live is a no-op. */
  connect: () => void;
  /**
   * Close the socket and stop reconnecting. Uses close code `1000`, which
   * invalidates the session server-side (a deliberate "I'm done", not a drop).
   */
  close: () => void;
  /** Send a payload. Throws if the socket isn't open. */
  send: (payload: Pick<GatewayPayload, `op` | `d`>) => void;
  /** Subscribe to every dispatch event. Used by the per-event fan-out. */
  onDispatch: (handler: (event: DispatchEvent) => void) => Subscription;
  /** Subscribe to lifecycle state changes. */
  onStateChange: (handler: (state: ConnectionState) => void) => Subscription;
}

/**
 * A Gateway connection: owns one WebSocket and the session state around it.
 *
 * Uses the **global** `WebSocket` rather than a Node-specific library, which is
 * what keeps this runnable on Workers/Durable Objects as well as Node 22+. It
 * also means MSW can intercept it in tests by patching that same global, so the
 * production code path is the one under test.
 *
 * Nothing happens until {@link connect} is called, so constructing one at
 * module scope is side-effect free. Disposable, so a connection can be scoped
 * to a block and cleaned up even if that block throws:
 *
 * ```ts
 * using connection = new GatewayConnection({ token, intents: [onMessageCreate] });
 * connection.connect();
 * ```
 *
 * The `#private` fields are the Gateway's session state machine rather than
 * incidental bookkeeping: RESUME needs the last sequence number Discord sent,
 * and heartbeat health is defined by whether the previous ACK arrived. The
 * decisions that *are* pure — {@link backoffDelay} and {@link closeAction} —
 * are lifted out so they can be tested without driving a socket.
 *
 * Methods are arrow-function properties, matching `DiscordSession`, so `this`
 * survives destructuring (`const { connect } = connection`).
 */
export class GatewayConnection implements ConnectionLike, Disposable {
  readonly #config: ConnectionConfig;
  readonly #scheduler: Scheduler;
  readonly #dispatchHandlers = new Set<(event: DispatchEvent) => void>();
  readonly #stateHandlers = new Set<(state: ConnectionState) => void>();

  #socket: WebSocket | null = null;
  #state: ConnectionState = `idle`;
  #sessionId: string | null = null;
  #resumeUrl: string | null = null;
  /** Last sequence number seen; sent when heartbeating and resuming. */
  #sequence: number | null = null;
  // Timer handles are opaque: the scheduler may back them with global timers,
  // Durable Object alarms, or a fake clock in tests.
  #heartbeatTimer: unknown = null;
  #ackTimer: unknown = null;
  #reconnectTimer: unknown = null;
  #heartbeatInterval = 0;
  #awaitingAck = false;
  /** Consecutive failed attempts, used for exponential backoff. */
  #attempts = 0;
  /** Set by `close()` so an intentional shutdown doesn't reconnect. */
  #stopped = false;

  constructor(config: ConnectionConfig) {
    this.#config = config;
    this.#scheduler = config.scheduler ?? globalScheduler;
  }

  /** Current lifecycle state. */
  get state(): ConnectionState {
    return this.#state;
  }

  /** The active session id, once `READY` has been received. */
  get sessionId(): string | null {
    return this.#sessionId;
  }

  /** Open the socket. Idempotent — a second call while live is a no-op. */
  connect = (): void => {
    if (this.#socket !== null) return;
    this.#stopped = false;
    this.#open();
  };

  /**
   * Close the socket and stop reconnecting. Uses close code `1000`, which
   * invalidates the session server-side (a deliberate "I'm done", not a drop).
   */
  close = (): void => {
    this.#stopped = true;
    if (this.#reconnectTimer !== null) {
      this.#scheduler.clearTimeout(this.#reconnectTimer);
    }
    this.#reconnectTimer = null;
    this.#clearTimers();
    this.#socket?.close(CLOSE_DONE, `Client closed the connection`);
    this.#socket = null;
    this.#setState(`closed`);
  };

  /**
   * Leaving a `using` scope means "I'm done with this connection", which is
   * exactly {@link close}'s contract — so dispose is an alias rather than a
   * second, subtly different teardown path.
   */
  [Symbol.dispose] = (): void => {
    this.close();
  };

  /** Send a payload. Throws if the socket isn't open. */
  send = (payload: Pick<GatewayPayload, `op` | `d`>): void => {
    if (this.#socket?.readyState !== 1) {
      throw new Error(
        `Cannot send a Gateway payload while the connection is "${this.#state}". Call connect() and wait for the "ready" state before sending.`
      );
    }
    this.#socket.send(JSON.stringify(payload));
  };

  /** Subscribe to every dispatch event. Used by the per-event fan-out. */
  onDispatch = (handler: (event: DispatchEvent) => void): Subscription => {
    this.#dispatchHandlers.add(handler);
    return toSubscription(() => {
      this.#dispatchHandlers.delete(handler);
    });
  };

  /** Subscribe to lifecycle state changes. */
  onStateChange = (handler: (state: ConnectionState) => void): Subscription => {
    this.#stateHandlers.add(handler);
    return toSubscription(() => {
      this.#stateHandlers.delete(handler);
    });
  };

  #setState = (next: ConnectionState): void => {
    if (this.#state === next) return;
    this.#state = next;
    for (const handler of this.#stateHandlers) handler(next);
  };

  #clearTimers = (): void => {
    if (this.#heartbeatTimer !== null) {
      this.#scheduler.clearTimeout(this.#heartbeatTimer);
    }
    if (this.#ackTimer !== null) this.#scheduler.clearTimeout(this.#ackTimer);
    this.#heartbeatTimer = null;
    this.#ackTimer = null;
    this.#awaitingAck = false;
  };

  #sendHeartbeat = (): void => {
    // A heartbeat sent while the previous one is unacknowledged means the
    // connection is zombied: Discord stopped responding but the socket never
    // errored. The docs prescribe closing and resuming rather than continuing
    // to send into the void.
    if (this.#awaitingAck) {
      this.#socket?.close(CLOSE_RESUMABLE, `Heartbeat ACK not received`);
      return;
    }
    this.#awaitingAck = true;
    this.send({ op: GatewayOpcode.HEARTBEAT, d: this.#sequence });
    this.#ackTimer = this.#scheduler.setTimeout(() => {
      if (!this.#awaitingAck) return;
      this.#socket?.close(CLOSE_RESUMABLE, `Heartbeat ACK timed out`);
    }, this.#heartbeatInterval * ACK_TIMEOUT_FACTOR);

    // Re-arm from inside the callback rather than using a repeating timer.
    // `setInterval` would queue overlapping runs if a tick outlasts its own
    // interval, and a one-shot chain is the only shape a Durable Object alarm
    // (a single slot, re-armed on each fire) can express.
    this.#heartbeatTimer = this.#scheduler.setTimeout(
      this.#sendHeartbeat,
      this.#heartbeatInterval
    );
  };

  #startHeartbeat = (interval: number): void => {
    this.#heartbeatInterval = interval;
    // The first heartbeat is delayed by `interval * random()`. Discord asks for
    // this explicitly so that every bot reconnecting after one of their deploys
    // doesn't heartbeat in lockstep and stampede the gateway. The same handle
    // is reused for the jitter delay and the steady-state beats, since only one
    // heartbeat is ever pending.
    this.#heartbeatTimer = this.#scheduler.setTimeout(
      this.#sendHeartbeat,
      interval * Math.random()
    );
  };

  #identify = (): void => {
    this.#setState(`identifying`);
    this.send({
      op: GatewayOpcode.IDENTIFY,
      d: {
        token: this.#config.token,
        intents: toIntentMask(...resolveIntents(this.#config.intents)),
        properties: {
          os: this.#config.properties?.os ?? `linux`,
          browser: this.#config.properties?.browser ?? `discordkit`,
          device: this.#config.properties?.device ?? `discordkit`
        },
        ...(this.#config.shard ? { shard: this.#config.shard } : {})
      }
    });
  };

  #resume = (): void => {
    this.#setState(`resuming`);
    this.send({
      op: GatewayOpcode.RESUME,
      d: {
        token: this.#config.token,
        session_id: this.#sessionId,
        seq: this.#sequence
      }
    });
  };

  /** Reconnect after a backoff delay, unless `close()` was called. */
  #scheduleReconnect = (): void => {
    if (this.#stopped) return;
    const delay = backoffDelay(this.#attempts);
    this.#attempts++;
    this.#reconnectTimer = this.#scheduler.setTimeout(() => {
      this.#open();
    }, delay);
  };

  #handleDispatch = (payload: GatewayPayload): void => {
    if (typeof payload.s === `number`) this.#sequence = payload.s;
    const type = payload.t;
    if (typeof type !== `string`) return;

    // `d` stays in Discord's raw snake_case here. Camelizing is a recursive
    // deep-clone (~14µs on a MESSAGE_CREATE), and doing it eagerly meant paying
    // it for every PRESENCE_UPDATE and TYPING_START a busy guild floods you
    // with, whether or not anything was listening. The typed-event fan-out
    // camelizes lazily instead — only for events that actually have a
    // subscriber — which measured ~79% cheaper at a realistic subscribe ratio.
    //
    // So `onDispatch` delivers WIRE-SHAPED payloads. That's also the more
    // honest contract for a raw firehose: an inspector showing Gateway traffic
    // wants what Discord sent, not a transformed copy.
    const data = payload.d;

    if (type === `READY`) {
      // Read the wire names, since this runs before any camelization. Using
      // the camelCase names here would silently leave `sessionId` null, and
      // every reconnect would degrade from RESUME to a fresh IDENTIFY.
      const ready = data as {
        session_id?: string;
        resume_gateway_url?: string;
      };
      this.#sessionId = ready.session_id ?? null;
      this.#resumeUrl = ready.resume_gateway_url ?? null;
      this.#attempts = 0;
      this.#setState(`ready`);
    } else if (type === `RESUMED`) {
      this.#attempts = 0;
      this.#setState(`ready`);
    }

    for (const handler of this.#dispatchHandlers) {
      handler({ type, data });
    }
  };

  #handleMessage = (raw: string): void => {
    let payload: GatewayPayload;
    try {
      payload = JSON.parse(raw) as GatewayPayload;
    } catch {
      // A frame we can't parse isn't actionable — Discord only sends JSON on a
      // `encoding=json` connection, so this means corruption, not a protocol
      // variant we should handle.
      return;
    }

    switch (payload.op) {
      case GatewayOpcode.DISPATCH:
        this.#handleDispatch(payload);
        break;
      case GatewayOpcode.HELLO: {
        const { heartbeat_interval: interval } = payload.d as {
          heartbeat_interval: number;
        };
        this.#startHeartbeat(interval);
        // A live session id means this socket is a reconnect, so resume rather
        // than identify — resuming replays missed events, identifying loses them
        // and burns one of the (limited) daily session starts.
        if (this.#sessionId !== null && this.#sequence !== null) this.#resume();
        else this.#identify();
        break;
      }
      case GatewayOpcode.HEARTBEAT:
        // Discord can ask for an immediate heartbeat, out of band of our timer.
        this.#awaitingAck = false;
        this.send({ op: GatewayOpcode.HEARTBEAT, d: this.#sequence });
        break;
      case GatewayOpcode.HEARTBEAT_ACK:
        this.#awaitingAck = false;
        if (this.#ackTimer !== null) {
          this.#scheduler.clearTimeout(this.#ackTimer);
        }
        this.#ackTimer = null;
        break;
      case GatewayOpcode.RECONNECT:
        this.#socket?.close(CLOSE_RESUMABLE, `Reconnect requested`);
        break;
      case GatewayOpcode.INVALID_SESSION: {
        // `d` is a boolean: whether the invalidated session can still be resumed.
        const resumable = payload.d === true;
        if (!resumable) {
          this.#sessionId = null;
          this.#sequence = null;
        }
        this.#socket?.close(CLOSE_RESUMABLE, `Invalid session`);
        break;
      }
      // Send-only opcodes. Discord never sends these to us, so receiving one
      // means a protocol change worth noticing rather than silently ignoring —
      // but it isn't fatal, so don't throw on a live connection.
      case GatewayOpcode.IDENTIFY:
      case GatewayOpcode.PRESENCE_UPDATE:
      case GatewayOpcode.VOICE_STATE_UPDATE:
      case GatewayOpcode.RESUME:
      case GatewayOpcode.REQUEST_GUILD_MEMBERS:
      case GatewayOpcode.REQUEST_SOUNDBOARD_SOUNDS:
      case GatewayOpcode.REQUEST_CHANNEL_INFO:
        break;
    }
  };

  #handleClose = (code: number): void => {
    this.#clearTimers();
    this.#socket = null;

    if (this.#stopped) {
      this.#setState(`closed`);
      return;
    }

    const { reconnect, discardSession } = closeAction(code);

    // A session that can't be resumed must be dropped, so the next connection
    // IDENTIFYs cleanly instead of RESUMEing against a session Discord has
    // already forgotten.
    if (discardSession) {
      this.#sessionId = null;
      this.#sequence = null;
    }

    // A fatal close fails identically on every retry, so reconnecting is an
    // infinite loop that burns the daily session start limit. Stop instead.
    if (!reconnect) {
      this.#stopped = true;
      this.#setState(`closed`);
      return;
    }

    this.#scheduleReconnect();
  };

  #open = (): void => {
    this.#setState(`connecting`);
    // Resume against the URL READY handed us; it points at the gateway node
    // holding the session. Falling back to the default URL would land on a node
    // that has never heard of this session.
    const base =
      this.#sessionId !== null && this.#resumeUrl !== null
        ? this.#resumeUrl
        : (this.#config.url ?? DEFAULT_GATEWAY_URL);
    const url = new URL(base);
    url.searchParams.set(`v`, String(GATEWAY_VERSION));
    url.searchParams.set(`encoding`, `json`);

    const ws = new WebSocket(url.toString());
    this.#socket = ws;

    ws.addEventListener(`message`, (event: MessageEvent) => {
      if (typeof event.data === `string`) this.#handleMessage(event.data);
    });
    ws.addEventListener(`close`, (event: CloseEvent) => {
      this.#handleClose(event.code);
    });
    // No `error` listener: the WebSocket spec fires `error` immediately before
    // `close`, and `close` owns the reconnect decision. Handling both would
    // schedule two reconnects for a single failure.
  };
}
