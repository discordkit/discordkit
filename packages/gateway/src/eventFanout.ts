import { useConnection } from "./ambient.js";
import type { DispatchEvent, GatewayConnection } from "./connection.js";
import { toSubscription, type Subscription } from "./subscription.js";

/** Options every event subscription accepts. */
export interface EventOptions {
  /**
   * Target a specific connection instead of the ambient singleton. Durable
   * Objects should always pass this — module globals are per-isolate.
   */
  connection?: GatewayConnection;
}

/**
 * Per-connection registry of `wire event name -> subscribers`, plus the single
 * `onDispatch` subscription that feeds them.
 *
 * A `WeakMap` so a discarded connection's handlers don't pin it in memory.
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
  // ONE dispatch subscription per connection, no matter how many event types
  // are subscribed. The connection emits every event; this routes on `t` so a
  // handler only runs for its own event.
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
 * Build a typed subscription function for a single dispatch event.
 *
 * Each event module calls this once at module scope and exports the result, so
 * `onMessageCreate` and `onGuildCreate` are independent top-level consts. That
 * is what keeps the package tree-shakeable: importing one event never pulls in
 * another's registration, which is exactly what a monolithic
 * `client.on("messageCreate", …)` cannot offer.
 *
 * @example
 * ```ts
 * export const onMessageCreate = dispatchEvent<Message>(`MESSAGE_CREATE`);
 * ```
 */
export const dispatchEvent =
  <T>(type: string) =>
  (handler: (data: T) => void, options: EventOptions = {}): Subscription => {
    const connection = options.connection ?? useConnection();
    const { byEvent } = registryFor(connection);

    let subscribers = byEvent.get(type);
    if (!subscribers) {
      subscribers = new Set();
      byEvent.set(type, subscribers);
    }
    const subscriber = handler as (data: never) => void;
    subscribers.add(subscriber);

    return toSubscription(() => {
      subscribers.delete(subscriber);
      // Deliberately keep the event's (now empty) Set and the connection's
      // dispatch subscription. Both are tiny, and re-subscribing is the common
      // case — tearing them down would churn on every resubscribe for no
      // measurable gain.
    });
  };
