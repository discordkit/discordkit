import { useSyncExternalStore } from "react";
import type { Status } from "@discordkit/electron/renderer";

/**
 * External store backing {@link useDiscordStatus}, designed for
 * `useSyncExternalStore` — the idiomatic way to subscribe a component to an
 * external mutable source (here, the IPC `onStatus` stream) without `useEffect`.
 *
 * `useSyncExternalStore` needs a SYNCHRONOUS `getSnapshot`, but the bridge's
 * `getStatus()` is async (an IPC round-trip). We bridge that by caching the
 * latest status: the `onStatus` subscription updates the cache synchronously as
 * events arrive, and we seed it once on first subscribe.
 */
let current: Status = `Disconnected`;
let seeded = false;
const listeners = new Set<() => void>();

const emit = (): void => {
  for (const notify of listeners) notify();
};

const subscribe = (onChange: () => void): (() => void) => {
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
};

/** The live Discord connection status, kept in sync with the IPC event stream. */
export const useDiscordStatus = (): Status =>
  useSyncExternalStore(subscribe, () => current);
