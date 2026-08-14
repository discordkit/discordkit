import { isObject } from "@discordkit/core/utils/isObject";
import { toCamelKeys } from "@discordkit/core/utils/toCamelKeys";
import { GatewayCloseCode, isReconnectable } from "./types/GatewayCloseCode.js";
import { GatewayOpcode } from "./types/GatewayOpcode.js";
import type { GatewayPayload } from "./types/GatewayPayload.js";
import type { GatewayIntentName } from "./types/GatewayIntents.js";
import { intents as toIntentMask } from "./types/GatewayIntents.js";
import { toSubscription, type Subscription } from "./subscription.js";

/** The Gateway API version this client speaks. */
export const GATEWAY_VERSION = 10;

/** Default Gateway URL, used when none is supplied via {@link ConnectionConfig.url}. */
export const DEFAULT_GATEWAY_URL = `wss://gateway.discord.gg/`;

/** How long to wait for a `HEARTBEAT_ACK` before treating the socket as zombied. */
const ACK_TIMEOUT_FACTOR = 1;

/** Bounds for the reconnect backoff, in milliseconds. */
const BACKOFF_MIN = 1_000;
const BACKOFF_MAX = 30_000;

export interface ConnectionConfig {
  /**
   * Bot token, **without** the `Bot ` prefix — it's added when identifying.
   */
  token: string;
  /** Intents to request. Combined into the bitfield sent with `IDENTIFY`. */
  intents: readonly GatewayIntentName[];
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

export interface GatewayConnection {
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
 * Create a Gateway connection.
 *
 * Uses the **global** `WebSocket` rather than a Node-specific library, which is
 * what keeps this runnable on Workers/Durable Objects as well as Node 22+. It
 * also means MSW can intercept it in tests by patching that same global, so the
 * production code path is the one under test — there is no injected transport
 * seam to diverge from reality.
 *
 * Nothing happens until {@link GatewayConnection.connect} is called, so building
 * a connection at module scope is side-effect free.
 */
export const createConnection = (
  config: ConnectionConfig
): GatewayConnection => {
  const dispatchHandlers = new Set<(event: DispatchEvent) => void>();
  const stateHandlers = new Set<(state: ConnectionState) => void>();

  let socket: WebSocket | null = null;
  let state: ConnectionState = `idle`;
  let sessionId: string | null = null;
  let resumeUrl: string | null = null;
  /** Last sequence number seen; sent when heartbeating and resuming. */
  let sequence: number | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let ackTimer: ReturnType<typeof setTimeout> | null = null;
  let jitterTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatInterval = 0;
  let awaitingAck = false;
  /** Consecutive failed attempts, used for exponential backoff. */
  let attempts = 0;
  /** Set by `close()` so an intentional shutdown doesn't reconnect. */
  let stopped = false;

  const setState = (next: ConnectionState): void => {
    if (state === next) return;
    state = next;
    for (const handler of stateHandlers) handler(next);
  };

  const clearTimers = (): void => {
    if (heartbeatTimer !== null) clearInterval(heartbeatTimer);
    if (ackTimer !== null) clearTimeout(ackTimer);
    if (jitterTimer !== null) clearTimeout(jitterTimer);
    heartbeatTimer = null;
    ackTimer = null;
    jitterTimer = null;
    awaitingAck = false;
  };

  const send = (payload: Pick<GatewayPayload, `op` | `d`>): void => {
    if (socket?.readyState !== 1) {
      throw new Error(
        `Cannot send a Gateway payload while the connection is "${state}". Call connect() and wait for the "ready" state before sending.`
      );
    }
    socket.send(JSON.stringify(payload));
  };

  const sendHeartbeat = (): void => {
    // A heartbeat sent while the previous one is unacknowledged means the
    // connection is zombied: Discord stopped responding but the socket never
    // errored. The docs prescribe closing and resuming rather than continuing
    // to send into the void. 4000 (not 1000) keeps the session resumable.
    if (awaitingAck) {
      socket?.close(4000, `Heartbeat ACK not received`);
      return;
    }
    awaitingAck = true;
    send({ op: GatewayOpcode.HEARTBEAT, d: sequence });
    ackTimer = setTimeout(() => {
      if (!awaitingAck) return;
      socket?.close(4000, `Heartbeat ACK timed out`);
    }, heartbeatInterval * ACK_TIMEOUT_FACTOR);
  };

  const startHeartbeat = (interval: number): void => {
    heartbeatInterval = interval;
    // The first heartbeat is delayed by `interval * random()`. Discord asks for
    // this explicitly so that every bot reconnecting after one of their deploys
    // doesn't heartbeat in lockstep and stampede the gateway.
    jitterTimer = setTimeout(() => {
      sendHeartbeat();
      heartbeatTimer = setInterval(sendHeartbeat, interval);
    }, interval * Math.random());
  };

  const identify = (): void => {
    setState(`identifying`);
    send({
      op: GatewayOpcode.IDENTIFY,
      d: {
        token: config.token,
        intents: toIntentMask(...config.intents),
        properties: {
          os: config.properties?.os ?? `linux`,
          browser: config.properties?.browser ?? `discordkit`,
          device: config.properties?.device ?? `discordkit`
        },
        ...(config.shard ? { shard: config.shard } : {})
      }
    });
  };

  const resume = (): void => {
    setState(`resuming`);
    send({
      op: GatewayOpcode.RESUME,
      d: {
        token: config.token,
        session_id: sessionId,
        seq: sequence
      }
    });
  };

  /** Reconnect after `delay`, unless `close()` was called. */
  const scheduleReconnect = (): void => {
    if (stopped) return;
    const delay = Math.min(BACKOFF_MIN * 2 ** attempts, BACKOFF_MAX);
    attempts++;
    reconnectTimer = setTimeout(() => {
      open();
    }, delay);
  };

  const handleDispatch = (payload: GatewayPayload): void => {
    if (typeof payload.s === `number`) sequence = payload.s;
    const type = payload.t;
    if (typeof type !== `string`) return;

    // Camelize at the transport boundary, exactly as the REST layer does in
    // core's `request.ts`. Discord sends snake_case on the wire, but every
    // discordkit schema is authored in camelCase — so without this, reusing
    // `messageSchema` & co. for dispatch payloads fails on every multi-word
    // field (`channel_id`, `mention_everyone`). Doing it here rather than
    // per-event means one consistent shape for everything downstream.
    const data = isObject(payload.d) ? toCamelKeys(payload.d) : payload.d;

    if (type === `READY`) {
      const ready = data as {
        sessionId?: string;
        resumeGatewayUrl?: string;
      };
      sessionId = ready.sessionId ?? null;
      resumeUrl = ready.resumeGatewayUrl ?? null;
      attempts = 0;
      setState(`ready`);
    } else if (type === `RESUMED`) {
      attempts = 0;
      setState(`ready`);
    }

    for (const handler of dispatchHandlers) {
      handler({ type, data });
    }
  };

  const handleMessage = (raw: string): void => {
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
        handleDispatch(payload);
        break;
      case GatewayOpcode.HELLO: {
        const { heartbeat_interval: interval } = payload.d as {
          heartbeat_interval: number;
        };
        startHeartbeat(interval);
        // A live session id means this socket is a reconnect, so resume rather
        // than identify — resuming replays missed events, identifying loses them
        // and burns one of the (limited) daily session starts.
        if (sessionId !== null && sequence !== null) resume();
        else identify();
        break;
      }
      case GatewayOpcode.HEARTBEAT:
        // Discord can ask for an immediate heartbeat, out of band of our timer.
        awaitingAck = false;
        send({ op: GatewayOpcode.HEARTBEAT, d: sequence });
        break;
      case GatewayOpcode.HEARTBEAT_ACK:
        awaitingAck = false;
        if (ackTimer !== null) clearTimeout(ackTimer);
        ackTimer = null;
        break;
      case GatewayOpcode.RECONNECT:
        // 4000 keeps the session resumable, unlike 1000.
        socket?.close(4000, `Reconnect requested`);
        break;
      case GatewayOpcode.INVALID_SESSION: {
        // `d` is a boolean: whether the invalidated session can still be resumed.
        const resumable = payload.d === true;
        if (!resumable) {
          sessionId = null;
          sequence = null;
        }
        socket?.close(4000, `Invalid session`);
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

  const handleClose = (code: number): void => {
    clearTimers();
    socket = null;

    if (stopped) {
      setState(`closed`);
      return;
    }

    // A fatal close (bad token, invalid or disallowed intents, invalid shard)
    // will fail identically on every retry, so reconnecting is an infinite loop
    // that burns the daily session start limit. Stop and surface it instead.
    if (!isReconnectable(code)) {
      stopped = true;
      setState(`closed`);
      return;
    }

    // A session is only resumable for a few minutes and only if the close
    // wasn't a clean 1000/1001; otherwise start fresh.
    // 1000/1001 are the WHATWG "clean close" codes, not Discord close codes —
    // they're plain numbers rather than GatewayCloseCode members.
    const cleanClose = code === 1000 || code === 1001;
    if (cleanClose || code === GatewayCloseCode.SESSION_TIMED_OUT) {
      sessionId = null;
      sequence = null;
    }

    scheduleReconnect();
  };

  function open(): void {
    setState(`connecting`);
    // Resume against the URL READY handed us; it points at the gateway node
    // holding the session. Falling back to the default URL would land on a node
    // that has never heard of this session.
    const base =
      sessionId !== null && resumeUrl !== null
        ? resumeUrl
        : (config.url ?? DEFAULT_GATEWAY_URL);
    const url = new URL(base);
    url.searchParams.set(`v`, String(GATEWAY_VERSION));
    url.searchParams.set(`encoding`, `json`);

    const ws = new WebSocket(url.toString());
    socket = ws;

    ws.addEventListener(`message`, (event: MessageEvent) => {
      if (typeof event.data === `string`) handleMessage(event.data);
    });
    ws.addEventListener(`close`, (event: CloseEvent) => {
      handleClose(event.code);
    });
    // No `error` listener: the WebSocket spec fires `error` immediately before
    // `close`, and `close` owns the reconnect decision. Handling both would
    // schedule two reconnects for a single failure.
  }

  return {
    get state(): ConnectionState {
      return state;
    },
    get sessionId(): string | null {
      return sessionId;
    },
    connect: (): void => {
      if (socket !== null) return;
      stopped = false;
      open();
    },
    close: (): void => {
      stopped = true;
      if (reconnectTimer !== null) clearTimeout(reconnectTimer);
      reconnectTimer = null;
      clearTimers();
      // 1000 tells Discord this is intentional, invalidating the session so it
      // isn't held open waiting for a resume that will never come.
      socket?.close(1000, `Client closed the connection`);
      socket = null;
      setState(`closed`);
    },
    send,
    onDispatch: (handler): Subscription => {
      dispatchHandlers.add(handler);
      return toSubscription(() => {
        dispatchHandlers.delete(handler);
      });
    },
    onStateChange: (handler): Subscription => {
      stateHandlers.add(handler);
      return toSubscription(() => {
        stateHandlers.delete(handler);
      });
    }
  };
};
