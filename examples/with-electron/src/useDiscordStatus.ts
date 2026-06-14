import { useSyncExternalStore } from "react";
import type { Status } from "@discordkit/electron/renderer";

/** A `useSyncExternalStore`-shaped store: subscribe + synchronous snapshot. */
interface StatusStore {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => Status;
}

/**
 * The status store backing {@link useDiscordStatus}. Module-scoped (a single shared snapshot is the whole point of `useSyncExternalStore` — every component sees the same status), but encapsulated in a closure so the mutable state isn't loose module globals.
 *
 * `useSyncExternalStore` needs a SYNCHRONOUS `getSnapshot`, but the bridge's `getStatus()` is async (an IPC round-trip). We bridge that by caching the latest status: `onStatus` updates the cache as events arrive, and the first subscriber seeds it once.
 */
const createStatusStore = (): StatusStore => {
  let current: Status = `Disconnected`;
  let seeded = false;
  const listeners = new Set<() => void>();
  const emit = (): void => {
    for (const notify of listeners) notify();
  };
  return {
    subscribe: (onChange: () => void): (() => void) => {
      listeners.add(onChange);
      // Bridge the live status events into the cache (+ notify React).
      const off = window.discord.onStatus((status) => {
        current = status;
        emit();
      });
      // Seed the current value once (the first subscriber triggers the IPC read).
      if (!seeded) {
        seeded = true;
        void (async () => {
          current = await window.discord.getStatus();
          emit();
        })();
      }
      return () => {
        listeners.delete(onChange);
        off();
      };
    },
    getSnapshot: (): Status => current
  };
};

const store = createStatusStore();

/** The live Discord connection status, kept in sync with the IPC event stream. */
export const useDiscordStatus = (): Status =>
  useSyncExternalStore(store.subscribe, store.getSnapshot);
