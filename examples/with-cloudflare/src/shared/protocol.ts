import * as v from "valibot";
import type { GatewayIntentName } from "@discordkit/gateway";

/**
 * The wire protocol between the Durable Object and the browser.
 *
 * Kept in its own module so both halves import the same definitions — the
 * Worker bundle and the client bundle are built separately, so a drift here is
 * a runtime bug neither typechecker would catch on its own.
 */

/** Why an event is worth flagging in the UI. */
export interface EventWarning {
  kind: `empty-content`;
  /** The intent that would have populated the field, e.g. `MESSAGE_CONTENT`. */
  intent: GatewayIntentName;
  message: string;
}

/** One observed Gateway event, as streamed to the browser. */
export interface InspectedEvent {
  /** Monotonic id, so the client can key rows without trusting timestamps. */
  id: number;
  /** Wire event name (`MESSAGE_CREATE`) or lifecycle label (`HELLO`). */
  type: string;
  /** `dispatch` for Discord events; `lifecycle` for the protocol handshake. */
  category: `dispatch` | `lifecycle`;
  /** Epoch ms when the DO observed it. */
  at: number;
  /** Sequence number from the payload, when the event carried one. */
  seq: number | null;
  /**
   * The payload exactly as Discord sent it, in snake_case. The inspector
   * subscribes via `onDispatch`, which delivers the raw wire shape — the typed
   * fan-out is what camelizes, and only for events with a subscriber. The
   * payload panel applies `toCamelKeys` itself to show the discordkit view.
   */
  data: unknown;
  /** Intents that gate this event; empty when Discord always delivers it. */
  intents: readonly GatewayIntentName[];
  /** Anything the inspector wants to call out, e.g. silently-empty content. */
  warnings: readonly EventWarning[];
}

/**
 * What the UI needs from `GET /applications/@me`.
 *
 * Deliberately narrow: the full Application object is large and mostly
 * irrelevant here, and the token-adjacent parts of it have no business
 * reaching the browser.
 */
export interface ApplicationInfo {
  id: string;
  name: string;
  /** Privileged intents enabled in the Developer Portal, from `flags`. */
  enabledPrivileged: readonly GatewayIntentName[];
}

/** Connection status, mirrored to every viewer. */
export interface InspectorStatus {
  state: string;
  sessionId: string | null;
  /** Intents the connection actually identified with. */
  intents: readonly GatewayIntentName[];
  /** Privileged intents requested but seemingly not granted. */
  missingIntents: readonly GatewayIntentName[];
  /** Events seen since the connection opened. */
  eventCount: number;
  /**
   * Whether the server has a `DISCORD_BOT_TOKEN` configured, so the UI can
   * enable Connect without a typed token and say where it came from.
   *
   * A boolean, never the token itself — the value must not reach the browser.
   */
  tokenFromEnv: boolean;
  /**
   * Whether the inspector is capturing events into the buffer.
   *
   * Separate from the connection: pausing keeps the Gateway session alive and
   * the heartbeat running, and only stops recording. Reconnecting to change
   * this would cost a session start for a purely local decision.
   */
  recording: boolean;
  /**
   * Event types being recorded, or `null` for "everything".
   *
   * An allowlist, not an intent change: Discord still sends every event the
   * identified intents cover. This only decides what gets kept, so narrowing
   * it is free where narrowing intents means a reconnect.
   */
  recordFilter: readonly string[] | null;
  /** Event types seen this session, so the UI can offer a filter list. */
  seenTypes: readonly string[];
  /**
   * The bot's application, once fetched over REST.
   *
   * Carries the app id (so the Developer Portal link can deep-link to this
   * bot's settings) and which privileged intents are actually enabled there —
   * turning a 4014 close from a post-hoc mystery into something the UI can
   * warn about before you connect.
   */
  application: ApplicationInfo | null;
  /** Epoch ms the socket opened, or `null` when disconnected. */
  connectedAt: number | null;
}

/** Messages the Durable Object pushes to browsers. */
export type ServerMessage =
  | { type: `status`; status: InspectorStatus }
  | { type: `event`; event: InspectedEvent }
  /** Sent once on connect so a late viewer isn't staring at an empty list. */
  | { type: `backlog`; events: readonly InspectedEvent[] }
  | { type: `error`; message: string };

/**
 * Messages browsers send to the Durable Object.
 *
 * Defined as a valibot schema and the type derived from it, so the two cannot
 * drift. The DO parses every inbound frame against this: it is a public
 * WebSocket endpoint, and `JSON.parse` alone would let a malformed payload
 * through to be read as a `ClientMessage` it isn't.
 */
const intentList = v.pipe(
  v.array(v.string() as v.GenericSchema<GatewayIntentName>),
  v.readonly()
);

export const clientMessageSchema = v.variant(`type`, [
  v.object({
    type: v.literal(`connect`),
    token: v.string(),
    intents: intentList
  }),
  /**
   * Re-IDENTIFY with a new intent set. Distinct from `connect` because it
   * tears down a live session — Discord only accepts intents in IDENTIFY, so
   * this necessarily costs one of the 1000 daily session starts.
   */
  v.object({
    type: v.literal(`reconnect`),
    intents: intentList
  }),
  v.object({ type: v.literal(`disconnect`) }),
  /** Start/stop capturing. Does not touch the Gateway connection. */
  v.object({ type: v.literal(`record`), recording: v.boolean() }),
  /** Set the recorded-type allowlist; `null` records everything. */
  v.object({
    type: v.literal(`recordFilter`),
    types: v.nullable(v.pipe(v.array(v.string()), v.readonly()))
  }),
  /**
   * Inject a synthetic event, for exercising the UI without a live Gateway:
   * a real session is too sparse to fill the timeline while developing it.
   */
  v.object({ type: v.literal(`simulate`), event: v.string() }),
  v.object({ type: v.literal(`clear`) })
]);

export type ClientMessage = v.InferOutput<typeof clientMessageSchema>;
