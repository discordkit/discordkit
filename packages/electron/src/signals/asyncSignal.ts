import { Signal } from "signal-polyfill";

/**
 * The reactive state of an in-flight async read. Every bridge read is an IPC
 * round-trip; this captures its lifecycle so a UI can render loading/error/data
 * without hand-rolling the bookkeeping.
 */
export interface AsyncState<T> {
  /** True while a run is in flight (initial load or a {@link AsyncSignal.reload}). */
  loading: boolean;
  /** The most recent successful result, or `undefined` before the first one. */
  data: T | undefined;
  /** The error from the most recent failed run, else `undefined`. */
  error: unknown;
}

/** A {@link Signal.State} of {@link AsyncState} with a `reload` to re-run the read. */
export interface AsyncSignal<T> extends Signal.State<AsyncState<T>> {
  /** Re-run the underlying read (e.g. after a mutation). Resolves when settled. */
  reload: () => Promise<void>;
}

/**
 * Wrap a promise-returning bridge read as a reactive **resource**: a signal that
 * tracks `{ loading, data, error }` and re-runs on demand.
 *
 * This is the Electron-IPC answer for the bridge's PULL-ONLY surfaces — reads
 * with no event stream to drive a true reactive signal (`relationships.list`,
 * `voice.getCalls`, `messages.getUserMessages`, `isSelfMuted`, …). Rather than
 * dress a static read up as auto-reactive, this models the thing that's actually
 * hard across the renderer↔main boundary: the async request lifecycle. It runs
 * once on creation, and a stale-run guard ensures only the latest `reload`'s
 * result is applied (an earlier slow IPC reply can't clobber a newer one).
 *
 * For state the bridge DOES push events for, prefer the auto-updating signals
 * (`statusSignal`, `lobbySignal`, …) — those don't need a manual reload.
 *
 * @example
 * ```ts
 * import { asyncSignal, subscribe } from "@discordkit/electron/signals";
 *
 * const friends = asyncSignal(() => window.discord.relationships.list());
 * using off = subscribe(friends, ({ loading, data }) => render(loading, data));
 * // after a mutation:
 * await window.discord.relationships.block(userId);
 * await friends.reload();
 * ```
 */
export const asyncSignal = <T>(read: () => Promise<T>): AsyncSignal<T> => {
  const state = new Signal.State<AsyncState<T>>({
    loading: true,
    data: undefined,
    error: undefined
  });

  // Monotonic run id: only the latest run is allowed to write results, so an
  // out-of-order IPC reply from a superseded run can't overwrite fresher data.
  let latestRun = 0;

  const reload = async (): Promise<void> => {
    const run = ++latestRun;
    const previous = state.get();
    state.set({ ...previous, loading: true, error: undefined });
    try {
      const data = await read();
      if (run === latestRun)
        state.set({ loading: false, data, error: undefined });
    } catch (error) {
      if (run === latestRun) {
        state.set({ loading: false, data: state.get().data, error });
      }
    }
  };

  void reload();
  return Object.assign(state, { reload }) as AsyncSignal<T>;
};
