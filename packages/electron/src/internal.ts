/**
 * Shared primitives for the per-domain bridge modules — the structural Electron
 * type slices, the preload `call`/`on` helpers, and the main-side registration
 * context. Importing this pulls in NO native code, so it never compromises a
 * domain module's tree-shaking.
 */

// --- main-process Electron slices (structural; no `electron` import) ---

/** The slice of Electron's `ipcMain` the registrars use. */
export interface IpcMainLike {
  handle: (
    channel: string,
    listener: (event: unknown, ...args: any[]) => unknown
  ) => void;
}

/** The slice of a window's `webContents` events are sent to. */
export interface WebContentsLike {
  send: (channel: string, ...args: any[]) => void;
  isDestroyed: () => boolean;
}

/**
 * The context `registerDiscord` hands to each per-domain registrar. A domain's
 * `registerX(context)` uses `handle` to wire its IPC handlers and `broadcast` to
 * push its events to every renderer target — without importing the core or any
 * sibling domain.
 */
export interface RegisterContext {
  /** Register an `invoke` handler for a channel. */
  handle: IpcMainLike[`handle`];
  /** Send an event to every (non-destroyed) renderer target. */
  broadcast: (channel: string, ...payload: unknown[]) => void;
  /** Track an unsubscribe so {@link DiscordMainHandle.dispose} tears it down. */
  track: (off: () => void) => void;
}

// --- preload Electron slices + helpers ---

/** The slice of Electron's `ipcRenderer` the bridge slices use. */
export interface IpcRendererLike {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  on: (
    channel: string,
    listener: (event: unknown, ...args: any[]) => void
  ) => void;
  removeListener: (
    channel: string,
    listener: (event: unknown, ...args: any[]) => void
  ) => void;
}

/**
 * The two shapes every bridge method takes, bound to one `ipcRenderer`. `call`
 * is a typed request→reply RPC over `invoke`; `on` registers a main→renderer
 * `send` listener and returns an unsubscribe. A domain's bridge slice is built
 * entirely from these.
 */
export interface BridgeIo {
  call: <T>(channel: string, ...args: unknown[]) => Promise<T>;
  on: <A extends unknown[]>(
    channel: string,
    handler: (...args: A) => void
  ) => () => void;
}

/** Build the {@link BridgeIo} helpers for one `ipcRenderer`. */
export const bridgeIo = (ipcRenderer: IpcRendererLike): BridgeIo => ({
  call: async <T>(channel: string, ...args: unknown[]): Promise<T> =>
    ipcRenderer.invoke(channel, ...args) as Promise<T>,
  on: <A extends unknown[]>(
    channel: string,
    handler: (...args: A) => void
  ): (() => void) => {
    const listener = (_event: unknown, ...args: unknown[]): void => {
      handler(...(args as A));
    };
    ipcRenderer.on(channel, listener);
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  }
});
