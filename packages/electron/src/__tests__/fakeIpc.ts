/**
 * A fake in-memory Electron IPC pair for testing the bridge wiring end to end —
 * the preload's `createDiscordBridge` talks to the main's `registerDiscord`
 * through these, exactly as the real `ipcRenderer`/`ipcMain` would, but without
 * Electron or a window.
 *
 * The bridge's job is *wiring*: map each renderer method to the right channel +
 * args, dispatch it to the right main handler, and route main→renderer events to
 * subscribers. These fakes make that round-trip observable so the tests assert
 * the user-facing outcome (the value the method resolves with / the event a
 * subscriber receives), not implementation details.
 */

type Handler = (event: unknown, ...args: any[]) => unknown;
type Listener = (event: unknown, ...args: any[]) => void;

/** A linked ipcMain + ipcRenderer + a way to push main→renderer events. */
export interface FakeIpc {
  ipcMain: {
    handle: (channel: string, handler: Handler) => void;
    /** Channels a handler was registered for (coverage assertions). */
    readonly channels: Set<string>;
  };
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    on: (channel: string, listener: Listener) => void;
    removeListener: (channel: string, listener: Listener) => void;
  };
  /** Simulate a main → renderer `send` (what `webContents.send` does). */
  emit: (channel: string, ...args: unknown[]) => void;
  /** A `WebContentsLike` target backed by {@link emit}, for `registerDiscord`. */
  target: {
    send: (channel: string, ...args: any[]) => void;
    isDestroyed: () => boolean;
  };
}

export const createFakeIpc = (): FakeIpc => {
  const handlers = new Map<string, Handler>();
  const listeners = new Map<string, Set<Listener>>();

  const emit = (channel: string, ...args: unknown[]): void => {
    for (const listener of listeners.get(channel) ?? [])
      listener(null, ...args);
  };

  return {
    ipcMain: {
      handle: (channel, handler) => {
        handlers.set(channel, handler);
      },
      get channels() {
        return new Set(handlers.keys());
      }
    },
    ipcRenderer: {
      invoke: async (channel, ...args) => {
        const handler = handlers.get(channel);
        if (!handler) throw new Error(`no handler for ${channel}`);
        return handler(null, ...args);
      },
      on: (channel, listener) => {
        const set = listeners.get(channel) ?? new Set<Listener>();
        set.add(listener);
        listeners.set(channel, set);
      },
      removeListener: (channel, listener) => {
        listeners.get(channel)?.delete(listener);
      }
    },
    emit,
    target: {
      send: (channel, ...args) => emit(channel, ...args),
      isDestroyed: () => false
    }
  };
};
