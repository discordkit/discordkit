import { Signal } from "signal-polyfill";
import type { LogEntry } from "@discordkit/native";
import type { CoreBridge } from "../channels/core.js";

/** The bridge slice this signal needs — a structural subset of {@link CoreBridge}. */
type LogSource = Pick<CoreBridge, `onLog`>;

/** Options for {@link logSignal}. */
export interface LogSignalOptions {
  /** Max entries to retain (oldest dropped past this). Default 100. */
  limit?: number;
}

/**
 * A `Signal.State<LogEntry[]>` holding a **rolling buffer** of the most recent
 * SDK log lines — reactive state for a log/console panel. Unlike status or
 * devices, log has no "current value" to seed from; it's a pure event stream, so
 * this accumulates `onLog` entries and caps the buffer at `limit` (default 100).
 *
 * @example
 * ```ts
 * import { logSignal, subscribe } from "@discordkit/tauri/signals";
 *
 * const logs = logSignal(discord, { limit: 200 });
 * using off = subscribe(logs, (entries) => renderConsole(entries));
 * ```
 */
export const logSignal = (
  bridge: LogSource,
  options: LogSignalOptions = {}
): Signal.State<LogEntry[]> => {
  const limit = options.limit ?? 100;
  const state = new Signal.State<LogEntry[]>([]);
  bridge.onLog((entry) => {
    const next = [...state.get(), entry];
    state.set(next.length > limit ? next.slice(next.length - limit) : next);
  });
  return state;
};
