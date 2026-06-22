import {
  bridgeIo,
  eventRouter,
  EVENT_SINK,
  type BridgeIo
} from "../internal.js";

/**
 * A controllable {@link BridgeIo} for signal/slice tests — the kkrpc analogue of
 * the Electron adapter's fake IPC. Unlike {@link fakeConnection} (which boots the
 * real native stub and yields fixed values), this lets a test register a handler
 * per channel and emit events on demand, so signals can be seeded with specific
 * values and driven with specific events.
 */
export interface FakeIo {
  /** The {@link BridgeIo} to build a bridge/slice over. */
  io: BridgeIo;
  /** Register the reply for a `call(channel, …)`. */
  handle: (channel: string, reply: (...args: unknown[]) => unknown) => void;
  /** Push an event to the channel's `on(channel, …)` subscribers. */
  emit: (channel: string, ...payload: unknown[]) => void;
}

export const fakeIo = (): FakeIo => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const router = eventRouter();

  // A remote proxy backed by the registered handlers; unknown channels reject
  // the same way the real bridgeIo does.
  const remote = new Proxy(
    {},
    {
      get:
        (_t, channel: string) =>
        async (...args: unknown[]) => {
          const handler = handlers.get(channel);
          if (!handler) {
            throw new Error(`No handler for "${channel}"`);
          }
          return handler(...args);
        },
      has: (_t, channel: string) => handlers.has(channel)
    }
  ) as Record<string, (...args: unknown[]) => Promise<unknown>>;

  const sink = router.localApi[EVENT_SINK] as (
    channel: string,
    ...payload: unknown[]
  ) => void;

  return {
    io: bridgeIo(remote, router),
    handle: (channel, reply) => handlers.set(channel, reply),
    emit: (channel, ...payload) => sink(channel, ...payload)
  };
};
