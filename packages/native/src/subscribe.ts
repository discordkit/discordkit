import { Signal } from "signal-polyfill";
import { toSubscription, type Subscription } from "./client.js";

/**
 * Ergonomic subscription over a TC39 signal. The proposal deliberately omits a
 * `.subscribe()` (you compose `Signal.Computed` or drive a `Signal.subtle.Watcher`
 * yourself); this wraps a Watcher once for the common "call me when it changes"
 * case, while leaving the underlying `Signal.State` untouched so power users can
 * still `Signal.Computed(() => status.get())` off it.
 *
 * The handler is invoked asynchronously (microtask) after each change — never
 * synchronously inside the Watcher's `notify`, per the proposal's rules. Returns
 * an unsubscribe function that is also a {@link Disposable}:
 *
 * ```ts
 * using sub = subscribe(status, (s) => { if (s === "Ready") … });
 * // or: const off = subscribe(status, cb); off();
 * ```
 */
export const subscribe = <T>(
  signal: Signal.State<T> | Signal.Computed<T>,
  handler: (value: T) => void
): Subscription => {
  let disposed = false;
  const watcher = new Signal.subtle.Watcher(() => {
    // Don't read signals inside notify; defer, then re-arm the watcher.
    queueMicrotask(() => {
      if (disposed) return;
      handler(signal.get());
      watcher.watch();
    });
  });
  watcher.watch(signal);

  // `disposed` also gates the deferred watcher microtask above, so it's set here
  // (not just inside toSubscription's own idempotency guard).
  return toSubscription(() => {
    disposed = true;
    watcher.unwatch(signal);
  });
};
