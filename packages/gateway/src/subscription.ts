/**
 * The `Subscription` shape + its constructor.
 *
 * Deliberately identical to `@discordkit/native`'s: every event/listener API
 * across discordkit hands back the same object, so `using sub = onX(...)` reads
 * the same whether you're driving the Social SDK or the Gateway.
 *
 * Unlike `native`, this carries no signals dependency. `native` uses
 * `signal-polyfill` because desktop UIs observe presence state reactively; a
 * Gateway connection runs backend-side, and in a Durable Object (single
 * threaded, event-loop driven) the microtask-deferred `Signal.subtle.Watcher`
 * machinery buys nothing over a plain `Set<handler>`.
 */

/** Unsubscribe handle that is also a {@link Disposable} for `using`. */
export type Subscription = (() => void) & Disposable;

/**
 * Wrap a teardown function as a {@link Subscription}: idempotent (safe to call
 * more than once) and `Disposable` (works with `using`).
 *
 * @example
 * ```ts
 * const off = toSubscription(() => handlers.delete(handler));
 * // later: off();  // or: using sub = toSubscription(...)
 * ```
 */
export const toSubscription = (teardown: () => void): Subscription => {
  let done = false;
  const unsubscribe = (): void => {
    if (done) return;
    done = true;
    teardown();
  };
  return Object.assign(unsubscribe, {
    [Symbol.dispose]: unsubscribe
  });
};
