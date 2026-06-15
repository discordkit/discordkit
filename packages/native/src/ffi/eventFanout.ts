import { useClient } from "../ambient.js";
import {
  toSubscription,
  type DiscordClient,
  type Subscription
} from "../client.js";
import { defineBindings } from "./bindings.js";

/**
 * Shared machinery for a domain's CLIENT-WIDE event streams.
 *
 * Several SDK callbacks are registered with a single client-wide SETTER
 * (`Discord_Client_SetLobby*Callback`, `...SetMessage*Callback`) rather than an
 * "add" — so registering one native callback per JS subscriber would clobber the
 * previous. This helper owns exactly ONE native callback per (client, event),
 * registered lazily on the first subscribe, and fans it out to a JS subscriber
 * `Set`. It mirrors `DiscordClient.onLog`, generalized across a domain's events.
 *
 * These events all deliver `uint64` ids (never handles) — `lobbyId`, `memberId`,
 * `messageId`, `channelId` — so handlers receive `bigint`s. An `arity` per event
 * says how many leading id args to forward (the rest is the SDK's `userData`).
 *
 * NOTE: this is for client-wide setters only. Per-INSTANCE event setters (e.g.
 * `Discord_Call_Set*Callback`, which live on a `Call` handle) are owned by that
 * instance and disposed with it — they do NOT use this.
 *
 * @example
 * ```ts
 * const events = clientEventFanout({
 *   created: { setter: `void Discord_Client_SetLobbyCreatedCallback(...)`,
 *              callback: `void LobbyCallback(uint64_t lobbyId, void *userData)`,
 *              arity: 1 },
 *   memberAdded: { setter: `...SetLobbyMemberAddedCallback(...)`,
 *              callback: `void LobbyMemberCallback(uint64_t lobbyId, uint64_t memberId, void *userData)`,
 *              arity: 2 }
 * });
 * export const onLobbyCreated = events<(lobbyId: bigint) => void>(`created`);
 * ```
 */

/** Configuration for one client-wide event: its setter, callback prototype, arity. */
export interface FanoutEvent {
  /** The C signature of the `Set*Callback` setter (takes self, cb, free, data). */
  readonly setter: string;
  /** The C prototype of the callback (leading `uint64` ids, then `void* userData`). */
  readonly callback: string;
  /** How many leading id args to forward to handlers as bigints. */
  readonly arity: number;
}

/** Options every event subscription accepts. */
export interface EventOptions {
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
}

/**
 * Build a domain's client-wide event fan-out from a per-event config map.
 * Returns a `subscribe(event)` factory: each call yields a typed subscription
 * function. The native callback for an event is wired once per client, lazily.
 */
export const clientEventFanout = <const E extends Record<string, FanoutEvent>>(
  events: E
): (<H extends (...args: never[]) => void>(
  event: keyof E
) => (handler: H, options?: EventOptions) => Subscription) => {
  // One binding decl set: each event's setter + a deduped callback per prototype.
  const setterDecls = Object.fromEntries(
    Object.entries(events).map(([name, e]) => [name, e.setter])
  );
  const callbackDecls = Object.fromEntries(
    Object.entries(events).map(([name, e]) => [
      `${name}__cb`,
      { callback: e.callback }
    ])
  );
  const bindings = defineBindings({ ...setterDecls, ...callbackDecls });

  type Subscriber = (...args: bigint[]) => void;
  const registries = new WeakMap<
    DiscordClient,
    Partial<Record<keyof E, Set<Subscriber>>>
  >();

  const subscribersFor = (
    client: DiscordClient,
    event: keyof E
  ): Set<Subscriber> => {
    let byEvent = registries.get(client);
    if (!byEvent) {
      byEvent = {};
      registries.set(client, byEvent);
    }
    const existing = byEvent[event];
    if (existing) return existing;

    const subscribers = new Set<Subscriber>();
    byEvent[event] = subscribers;
    const b = bindings(client.lib) as Record<string, unknown>;
    const { arity } = events[event as string];
    const cb = client.lib.registerCallback(
      b[`${String(event)}__cb`],
      (...args: unknown[]) => {
        const ids = args.slice(0, arity).map((a) => BigInt(a as bigint));
        for (const handler of subscribers) handler(...ids);
      }
    );
    client.trackCallback(cb);
    const setter = b[String(event)] as (...a: unknown[]) => unknown;
    setter(client.handle, cb, null, null);
    return subscribers;
  };

  return <H extends (...args: never[]) => void>(event: keyof E) =>
    (handler: H, options: EventOptions = {}): Subscription => {
      const client = options.client ?? useClient();
      const set = subscribersFor(client, event);
      // The public handler is typed with branded id params (e.g. (id: LobbyId));
      // the internal Subscriber set is raw (bigint[]) since the fanout produces
      // raw ids and brands them at the call boundary — so this re-cast is sound.
      const subscriber = handler as unknown as Subscriber;
      set.add(subscriber);
      return toSubscription(() => {
        set.delete(subscriber);
      });
    };
};
