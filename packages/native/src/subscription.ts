/**
 * The `Subscription` shape + its constructor, in a koffi-free module.
 *
 * Kept separate from `client.ts` (which loads the FFI backend at import) so that
 * purely-reactive consumers — e.g. `subscribe()` and the framework signal helpers
 * re-exported by the Electron/Tauri webview bundles — can use it WITHOUT dragging
 * koffi (a native `.node` addon) into a browser bundle. `client.ts` re-exports
 * both names, so the public API is unchanged.
 */

/** Unsubscribe handle that is also a {@link Disposable} for `using`. */
export type Subscription = (() => void) & Disposable;

/**
 * Wrap a teardown function as a {@link Subscription}: idempotent (safe to call
 * more than once) and `Disposable` (works with `using`). The single place the
 * "unsubscribe + `[Symbol.dispose]`" shape is defined, so every event/listener
 * API across the package returns the exact same object shape.
 *
 * @example
 * ```ts
 * const off = toSubscription(() => lib.unregisterCallback(cb));
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
  }) as Subscription;
};
