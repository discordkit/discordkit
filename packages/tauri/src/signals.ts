/**
 * Framework-agnostic reactive webview utilities for `@discordkit/tauri`, built on
 * the TC39 Signals proposal (via `signal-polyfill`) — the same primitive the rest
 * of discordkit uses. The bridge delivers state over kkrpc events (push); these
 * wrap that as a `Signal.State` with a synchronous current value (pull), so ANY
 * UI framework can consume it:
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
 * The factories take a structural slice of the bridge `createClient` returns, so
 * they work the same here as in `@discordkit/electron` — only the transport
 * underneath differs.
 *
 * @example
 * ```ts
 * import { statusSignal, devicesSignal, subscribe } from "@discordkit/tauri/signals";
 *
 * const discord = await createClient([voiceSlice]);
 * const status = statusSignal(discord);
 * const devices = devicesSignal(discord.voice);
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

/** The "call me when it changes" helper for any signal (TC39-spec, framework-free).
 * Imported from the isolated `/subscribe` subpath, NOT the package root — the root
 * also exports the FFI client (koffi), which must never enter a webview bundle. */
export { subscribe } from "@discordkit/native/subscribe";
export type { Subscription } from "@discordkit/native/subscription";
