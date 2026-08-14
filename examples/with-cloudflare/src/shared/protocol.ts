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
  /** The camelized payload discordkit hands your handler. */
  data: unknown;
  /** Intents that gate this event; empty when Discord always delivers it. */
  intents: readonly GatewayIntentName[];
  /** Anything the inspector wants to call out, e.g. silently-empty content. */
  warnings: readonly EventWarning[];
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

/** Messages browsers send to the Durable Object. */
export type ClientMessage =
  | { type: `connect`; token: string; intents: readonly GatewayIntentName[] }
  | { type: `disconnect` }
  | { type: `clear` };
