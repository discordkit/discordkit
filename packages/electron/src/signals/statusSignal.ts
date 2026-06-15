import { Signal } from "signal-polyfill";
import type { Status } from "@discordkit/native";
import type { CoreBridge } from "../channels/core.js";

/**
 * The bridge slice this signal needs — a structural subset of {@link CoreBridge}
 * so it works with any composed bridge that has the status surface.
 */
type StatusSource = Pick<CoreBridge, `getStatus` | `onStatus`>;

/**
 * A TC39 `Signal.State<Status>` tracking the live Discord connection status —
 * framework-agnostic reactive state for the renderer. The bridge's status is
 * delivered over IPC events (push) but a signal needs a synchronous current
 * value (pull); this bridges the two by seeding from `getStatus()` once and
 * updating on each `onStatus` event.
 *
 * Read it with `signal.get()`, and react to changes with the native `subscribe`
 * helper (re-exported from `@discordkit/native`) — or adapt it to your framework:
 * React via `useSyncExternalStore`, Vue/Solid by reading `.get()` in a reactive
 * scope, Svelte via a `readable`. The signal is the universal primitive; no
 * framework dependency is imposed.
 *
 * @example
 * ```ts
 * import { statusSignal } from "@discordkit/electron/signals";
 * import { subscribe } from "@discordkit/native";
 *
 * const status = statusSignal(window.discord);
 * using off = subscribe(status, (s) => console.log("status:", s)); // "ready", …
 * status.get(); // current value, synchronously
 * ```
 */
export const statusSignal = (bridge: StatusSource): Signal.State<Status> => {
  const state = new Signal.State<Status>(`disconnected`);
  // Push updates from the live event stream.
  bridge.onStatus((status) => state.set(status));
  // Pull the current value once (IPC round-trip) to seed.
  void (async () => {
    state.set(await bridge.getStatus());
  })();
  return state;
};
