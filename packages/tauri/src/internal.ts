/**
 * Shared primitives for the per-domain bridge modules — the kkrpc transport seam
 * that mirrors `@discordkit/electron`'s `internal.ts` in *shape* (a client-side
 * `call`/`on` {@link BridgeIo}; a sidecar-side `handle`/`broadcast`/`track`
 * {@link RegisterContext}), so the per-domain slices and registrars port across
 * the two adapters with only the transport swapped. Importing this pulls in NO
 * native code and NO kkrpc transport, so it never compromises a domain module's
 * tree-shaking.
 *
 * ## How the two adapters differ
 *
 * Electron has two OS-level IPC primitives (`ipcRenderer.invoke` for request→reply,
 * `webContents.send` for main→renderer push). kkrpc gives us *one* bidirectional
 * typed channel instead, so we model both directions on it:
 *
 * - **request→reply** (webview → sidecar): each channel string is an RPC *method*.
 *   The sidecar `expose`s a flat record `{ [channel]: handler }`; the client calls
 *   `api[channel](...args)`. {@link BridgeIo.call} is that call.
 * - **events** (sidecar → webview): the client `expose`s a single
 *   {@link EVENT_SINK} method; the sidecar's {@link RegisterContext.broadcast}
 *   invokes it with `(channel, ...payload)`. The client fans it out to the
 *   handlers registered via {@link BridgeIo.on}. No Tauri `emit`/`listen` needed —
 *   events ride the same channel as calls.
 */

/**
 * The teardown returned by every `on*` event subscription on the bridge: call it
 * to stop receiving the event. (Webview-side it's a plain function — unlike the
 * native package's `Subscription`, it isn't `Disposable`, since the RPC listener
 * has no native handle to release.)
 */
export type Unsubscribe = () => void;

/**
 * The single RPC method the webview exposes back to the sidecar, over which the
 * sidecar pushes events. Namespaced to avoid colliding with a channel name.
 */
export const EVENT_SINK = `discordkit:__event` as const;

// --- sidecar host: the registration context ---

/**
 * The flat record of RPC handlers the sidecar `expose`s to the webview. Each key
 * is a channel string (see `channels/<domain>.ts`); each value handles one call.
 * The first arg is the unwrapped call args (no Electron `event` first param —
 * kkrpc passes the call arguments directly).
 */
export type HandlerMap = Record<string, (...args: any[]) => unknown>;

/**
 * The context `createSidecar` hands to each per-domain registrar. A domain's
 * `registerX(context)` uses `handle` to wire its RPC handlers and `broadcast` to
 * push its events to the webview — without importing the core or a sibling domain.
 * Mirrors the Electron adapter's `RegisterContext` so registrars are near-identical.
 */
export interface RegisterContext {
  /** Register an RPC handler for a channel (the request→reply direction). */
  handle: (channel: string, handler: (...args: any[]) => unknown) => void;
  /** Push an event to the webview (the sidecar→webview direction). */
  broadcast: (channel: string, ...payload: unknown[]) => void;
  /** Track an unsubscribe so the sidecar tears it down on shutdown. */
  track: (off: () => void) => void;
}

// --- webview client: the call/on helpers ---

/**
 * The remote API the webview proxy exposes — a flat record of channel methods
 * the sidecar registered. Calls are `api[channel](...args)`. Typed loosely here;
 * each domain slice narrows its own calls.
 */
export type RemoteApi = Record<
  string,
  // `| undefined`: an un-wired domain has no handler on the proxy. The honest
  // index signature is what makes the runtime guard in `bridgeIo.call` (and its
  // directed error) reachable rather than "always falsy".
  ((...args: unknown[]) => Promise<unknown>) | undefined
>;

/**
 * The two shapes every bridge method takes, bound to one kkrpc connection. `call`
 * is a typed request→reply RPC over the proxy; `on` registers a sidecar→webview
 * event listener and returns an unsubscribe. A domain's bridge slice is built
 * entirely from these — identical surface to the Electron adapter's `BridgeIo`.
 */
export interface BridgeIo {
  call: <T>(channel: string, ...args: unknown[]) => Promise<T>;
  on: <A extends unknown[]>(
    channel: string,
    handler: (...args: A) => void
  ) => Unsubscribe;
}

/**
 * The event fan-out the webview side owns: the sidecar calls {@link EVENT_SINK}
 * with `(channel, ...payload)`, and this dispatches to every handler registered
 * for that channel. Returned alongside the local API the client exposes.
 */
export interface EventRouter {
  /** The local API to `expose` to the sidecar (just the event sink). */
  readonly localApi: Record<string, (...args: unknown[]) => void>;
  /** Register a handler for a channel's events; returns an unsubscribe. */
  subscribe: (
    channel: string,
    handler: (...args: unknown[]) => void
  ) => Unsubscribe;
}

/** Build the webview-side {@link EventRouter} (channel → handler set dispatch). */
export const eventRouter = (): EventRouter => {
  const handlers = new Map<string, Set<(...args: unknown[]) => void>>();
  return {
    localApi: {
      [EVENT_SINK]: (channel: unknown, ...payload: unknown[]): void => {
        for (const handler of handlers.get(channel as string) ?? []) {
          handler(...payload);
        }
      }
    },
    subscribe: (channel, handler) => {
      let set = handlers.get(channel);
      if (!set) {
        set = new Set();
        handlers.set(channel, set);
      }
      set.add(handler);
      return () => {
        set.delete(handler);
      };
    }
  };
};

/**
 * Build the {@link BridgeIo} helpers from a remote API proxy + the local
 * {@link EventRouter}. `call` invokes the matching remote channel method; `on`
 * registers with the router (events arrive via {@link EVENT_SINK}).
 */
export const bridgeIo = (remote: RemoteApi, router: EventRouter): BridgeIo => ({
  call: async <T>(channel: string, ...args: unknown[]): Promise<T> => {
    const method = remote[channel];
    if (!method) {
      throw new Error(
        `No sidecar handler for "${channel}". The sidecar host didn't register ` +
          `this domain — add its registrar to your createSidecar([...]) entry ` +
          `(e.g. registerPresence), rebuild the sidecar binary, and restart.`
      );
    }
    return method(...args) as Promise<T>;
  },
  on: <A extends unknown[]>(
    channel: string,
    handler: (...args: A) => void
  ): Unsubscribe =>
    router.subscribe(channel, (...args) => handler(...(args as A)))
});
