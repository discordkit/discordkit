import {
  init,
  subscribe,
  shutdown,
  type ClientConfig,
  type Status
} from "@discordkit/native";
import { authorize } from "@discordkit/native/auth";
import { setActivity, clearActivity } from "@discordkit/native/presence";
import { RPCChannel } from "kkrpc";
import { nodeStdioTransport } from "kkrpc/stdio";
import {
  CORE_CHANNELS,
  type ConnectMessage,
  type ActivityMessage
} from "./channels/core.js";
import {
  EVENT_SINK,
  type HandlerMap,
  type RegisterContext
} from "./internal.js";

/**
 * The CORE sidecar host — the Node process that runs the Discord Social SDK
 * (`@discordkit/native`) and speaks kkrpc JSON-RPC over stdio. The webview drives
 * it via the matching client; Tauri's Rust plugin spawns + supervises it and pumps
 * the bytes.
 *
 * `createSidecar` is the entry your app's `discord.sidecar.ts` calls. It always
 * wires the core (presence/auth/status/log); add feature domains by passing their
 * registrars (from `@discordkit/tauri/sidecar/<domain>`) — so the built sidecar
 * binary contains exactly the native code for the domains you wire, and importing
 * presence never pulls in voice. This is the tree-shaking boundary on the sidecar
 * surface (see `docs/tauri-sidecar-plugin-architecture.md` §6).
 *
 * ```ts
 * // app's discord.sidecar.ts
 * import { createSidecar } from "@discordkit/tauri/sidecar";
 * import { registerLobbies } from "@discordkit/tauri/sidecar/lobbies";
 * createSidecar([registerLobbies], { applicationId: 123n });
 * // then build it (vp pack) and point tauri.conf externalBin at the binary
 * ```
 *
 * **stdout is reserved for the RPC protocol** — the kkrpc stdio transport frames
 * messages on it — so this host (and `@discordkit/native`'s `onLog`) must never
 * `console.log`. Diagnostics go to stderr via {@link SidecarOptions.onError} or
 * the default (which writes to `process.stderr`).
 */

/** A per-domain sidecar registrar: wires its RPC handlers + event broadcasts. */
export type SidecarRegistrar = (context: RegisterContext) => void;

/** Options for {@link createSidecar}. */
export interface SidecarOptions extends ClientConfig {
  /**
   * Where to send the SDK's log lines and host diagnostics. Defaults to writing
   * to `process.stderr` (NOT stdout, which carries the RPC protocol). Set this to
   * forward logs to the webview or a file instead.
   */
  onError?: (message: string) => void;
}

/** A running sidecar host, for explicit teardown in tests or graceful shutdown. */
export interface SidecarHost {
  /** Stop the SDK pump, unsubscribe everything, and close the RPC channel. */
  dispose: () => void;
}

/**
 * Build the host without binding stdio — the testable core. Returns the flat
 * {@link HandlerMap} the webview calls, the local API to expose, and a dispose.
 * `createSidecar` wraps this with the kkrpc stdio transport; tests drive the map
 * directly without spawning a process.
 */
export const buildSidecar = (
  registrars: SidecarRegistrar[] = [],
  options: SidecarOptions = {}
): {
  handlers: HandlerMap;
  broadcast: (channel: string, ...payload: unknown[]) => void;
  setSink: (sink: (channel: string, ...payload: unknown[]) => void) => void;
  dispose: () => void;
} => {
  const { onError = (m) => process.stderr.write(`${m}\n`), ...config } =
    options;
  const client = init(config);

  // The webview's event sink, set once the RPC channel is connected. Until then
  // events are dropped (no webview is listening yet anyway).
  let sink: ((channel: string, ...payload: unknown[]) => void) | undefined;
  const broadcast = (channel: string, ...payload: unknown[]): void => {
    sink?.(channel, ...payload);
  };

  const handlers: HandlerMap = {};
  const subs: Array<() => void> = [
    subscribe(client.status, (status: Status) =>
      broadcast(CORE_CHANNELS.status, status)
    ),
    client.onLog((entry) => broadcast(CORE_CHANNELS.log, entry))
  ];

  const context: RegisterContext = {
    handle: (channel, handler) => {
      handlers[channel] = handler;
    },
    broadcast,
    track: (off) => subs.push(off)
  };

  // Core handlers (always present).
  context.handle(CORE_CHANNELS.connect, async (message?: ConnectMessage) => {
    await authorize({ scopes: message?.scopes ?? `presence` });
  });
  context.handle(CORE_CHANNELS.setActivity, async (input: ActivityMessage) => {
    await setActivity(input);
  });
  context.handle(CORE_CHANNELS.clearActivity, () => clearActivity());
  context.handle(CORE_CHANNELS.getStatus, () => client.status.get());

  // Compose the opted-in feature domains.
  for (const register of registrars) register(context);

  return {
    handlers,
    broadcast,
    setSink: (next) => {
      sink = next;
    },
    dispose: () => {
      for (const off of subs) {
        try {
          off();
        } catch (error) {
          onError(`discordkit sidecar: teardown error: ${String(error)}`);
        }
      }
      shutdown();
    }
  };
};

/**
 * Run the sidecar: build the host, bind it to stdin/stdout via kkrpc, and expose
 * the handlers to the webview. The webview exposes an {@link EVENT_SINK} back to
 * us, which we resolve to drive {@link RegisterContext.broadcast}. Call this from
 * your app's `discord.sidecar.ts`.
 */
export const createSidecar = (
  registrars: SidecarRegistrar[] = [],
  options: SidecarOptions = {}
): SidecarHost => {
  const host = buildSidecar(registrars, options);

  // Bidirectional channel: we expose the call handlers; we get a typed proxy to
  // the webview's local API (its event sink) for pushing events.
  const channel = new RPCChannel<
    HandlerMap,
    { [EVENT_SINK]: (channel: string, ...payload: unknown[]) => void }
  >(nodeStdioTransport(), { expose: host.handlers });

  const remote = channel.getAPI();
  host.setSink((eventChannel, ...payload) => {
    remote[EVENT_SINK](eventChannel, ...payload);
  });

  const dispose = (): void => {
    host.dispose();
    channel.destroy();
  };
  process.on(`SIGINT`, dispose);
  process.on(`SIGTERM`, dispose);

  return { dispose };
};
