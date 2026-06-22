import { Signal } from "signal-polyfill";
import type { Status } from "@discordkit/native";

/**
 * `true` when the client is fully connected (`status === "ready"`), as a
 * `Signal.Computed` derived from a status signal — the common "is Discord
 * usable yet?" gate, without re-checking the string everywhere.
 *
 * Pass the {@link statusSignal} you already created so they share one source
 * (and one IPC seed); this just projects it.
 *
 * @example
 * ```ts
 * import { statusSignal, isConnectedSignal, subscribe } from "@discordkit/electron/signals";
 *
 * const status = statusSignal(window.discord);
 * const connected = isConnectedSignal(status);
 * using off = subscribe(connected, (ready) => setActionsEnabled(ready));
 * ```
 */
export const isConnectedSignal = (
  status: Signal.State<Status> | Signal.Computed<Status>
): Signal.Computed<boolean> =>
  new Signal.Computed(() => status.get() === `ready`);
