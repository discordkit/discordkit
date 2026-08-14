import { useConnection } from "../ambient.js";
import type { DispatchEvent, GatewayConnection } from "../connection.js";
import { toSubscription, type Subscription } from "../subscription.js";
import {
  EVENT_INTENTS,
  type GatewayIntentName
} from "../types/GatewayIntents.js";

/** Options every event subscription accepts. */
export interface EventOptions {
  /**
   * Target a specific connection instead of the ambient singleton. Durable
   * Objects should always pass this — module globals are per-isolate.
   */
  connection?: GatewayConnection;
}

/**
 * The intents that gate a given event, as a type. Events Discord always
 * delivers aren't in {@link EVENT_INTENTS}, so they resolve to `never`.
 */
export type IntentsFor<E extends string> = E extends keyof typeof EVENT_INTENTS
  ? (typeof EVENT_INTENTS)[E][number]
  : never;

/**
 * Per-connection registry of `wire event name -> subscribers`, plus the single
 * `onDispatch` subscription feeding them. A `WeakMap` so a discarded connection
 * isn't pinned in memory by its handlers.
 */
interface Registry {
  byEvent: Map<string, Set<(data: never) => void>>;
  detach: Subscription;
}
const registries = new WeakMap<GatewayConnection, Registry>();

const registryFor = (connection: GatewayConnection): Registry => {
  const existing = registries.get(connection);
  if (existing) return existing;

  const byEvent = new Map<string, Set<(data: never) => void>>();
  // ONE dispatch subscription per connection regardless of how many event types
  // are subscribed; this routes on `t` so a handler only runs for its own event.
  const detach = connection.onDispatch((event: DispatchEvent) => {
    const subscribers = byEvent.get(event.type);
    if (!subscribers) return;
    for (const handler of subscribers) {
      (handler as (data: unknown) => void)(event.data);
    }
  });

  const registry: Registry = { byEvent, detach };
  registries.set(connection, registry);
  return registry;
};

/**
 * A typed subscription for one dispatch event.
 *
 * The `intents` property carries the intents Discord requires for the event to
 * arrive at all. It's a value (not just a type) so a bot can compute the exact
 * mask it needs from the handlers it actually registers:
 *
 * ```ts
 * connect({ token, intents: onMessageCreate.intents });
 * ```
 */
export interface EventSubscriber<T, E extends string> {
  (handler: (data: T) => void, options?: EventOptions): Subscription;
  /** The wire event name, e.g. `MESSAGE_CREATE`. */
  readonly event: E;
  /** Intents that gate this event. Empty when Discord always delivers it. */
  readonly intents: ReadonlyArray<IntentsFor<E>>;
}

/**
 * Build the exported subscriber for a single dispatch event.
 *
 * Each event module calls this once at module scope and exports the result, so
 * `onMessageCreate` and `onGuildCreate` are independent top-level consts. That
 * is what keeps the package tree-shakeable: importing one event never pulls in
 * another's registration — the thing a monolithic `client.on("messageCreate")`
 * cannot offer.
 *
 * @example
 * ```ts
 * export const onMessageCreate = dispatchEvent<MessageCreate, `MESSAGE_CREATE`>(
 *   `MESSAGE_CREATE`
 * );
 * ```
 */
export const dispatchEvent = <T, E extends string>(
  event: E
): EventSubscriber<T, E> => {
  const subscribe = (
    handler: (data: T) => void,
    options: EventOptions = {}
  ): Subscription => {
    const connection = options.connection ?? useConnection();
    const { byEvent } = registryFor(connection);

    let subscribers = byEvent.get(event);
    if (!subscribers) {
      subscribers = new Set();
      byEvent.set(event, subscribers);
    }
    const subscriber = handler as (data: never) => void;
    subscribers.add(subscriber);

    return toSubscription(() => {
      subscribers.delete(subscriber);
      // Deliberately keep the (now empty) Set and the connection's dispatch
      // subscription. Both are tiny and re-subscribing is the common case, so
      // tearing them down would churn for no measurable gain.
    });
  };

  return Object.assign(subscribe, {
    event,
    intents: ((EVENT_INTENTS as Record<string, readonly string[]>)[event] ??
      []) as ReadonlyArray<IntentsFor<E>>
  });
};

/**
 * Combine the intents required by a set of event subscribers.
 *
 * Pass the handlers a bot actually uses and it computes the exact intent set to
 * identify with — no over-requesting (which can mean a privileged-intent `4014`
 * for events you never read) and no under-requesting (which fails silently, the
 * events simply never arrive).
 *
 * @example
 * ```ts
 * connect({
 *   token,
 *   intents: intentsFor(onMessageCreate, onGuildCreate)
 * });
 * ```
 */
export const intentsFor = (
  ...subscribers: ReadonlyArray<{ intents: readonly GatewayIntentName[] }>
): GatewayIntentName[] => [
  ...new Set(subscribers.flatMap((s) => [...s.intents]))
];
