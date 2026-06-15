/**
 * Framework-agnostic reactive renderer utilities for `@discordkit/electron`,
 * built on the TC39 Signals proposal (via `signal-polyfill`) — the same primitive
 * the rest of discordkit uses. The bridge delivers state over IPC events (push);
 * these wrap that as a `Signal.State` with a synchronous current value (pull), so
 * ANY UI framework can consume it:
 *
 * - **React** — adapt with `useSyncExternalStore(subscribe-shim, () => sig.get())`.
 * - **Vue / Solid** — read `sig.get()` inside a reactive effect/computed.
 * - **Svelte** — wrap in a `readable(sig.get(), (set) => subscribe(sig, set))`.
 *
 * No framework dependency is imposed: you get a signal, you adapt it.
 *
 * This is a SEPARATE subpath so `signal-polyfill` is only bundled if you use it.
 * The factories are per-stream (compose only what you need); `subscribe` is
 * re-exported from `@discordkit/native` as the canonical "call me on change" glue.
 *
 * @example
 * ```ts
 * import { statusSignal, devicesSignal, subscribe } from "@discordkit/electron/signals";
 *
 * const status = statusSignal(window.discord);
 * const devices = devicesSignal(window.discord.voice);
 * using offStatus = subscribe(status, (s) => setConnectionBadge(s));
 * ```
 */

// --- event-backed (auto-updating) signals ---
export { statusSignal } from "./signals/statusSignal.js";
export { devicesSignal, type AudioDevices } from "./signals/devicesSignal.js";
export { logSignal, type LogSignalOptions } from "./signals/logSignal.js";
export { lobbyIdsSignal, lobbySignal } from "./signals/lobbySignals.js";

// --- derived helpers (Signal.Computed over the above) ---
export { isConnectedSignal } from "./signals/derived.js";

// --- async resource (for pull-only bridge reads with no event stream) ---
export {
  asyncSignal,
  type AsyncState,
  type AsyncSignal
} from "./signals/asyncSignal.js";

/** The "call me when it changes" helper for any signal (TC39-spec, framework-free). */
export { subscribe } from "@discordkit/native";
export type { Subscription } from "@discordkit/native";
