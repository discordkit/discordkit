import { describe, it, expect, afterEach, vi } from "vite-plus/test";
import { ws } from "msw";
import { setupServer } from "msw/node";
import { createConnection, type GatewayConnection } from "../connection.js";
import { GatewayOpcode } from "../types/GatewayOpcode.js";

/**
 * Protocol tests against a synthetic Gateway.
 *
 * MSW patches the global `WebSocket`, so `connection.ts` runs its real
 * `new WebSocket(url)` path — there is no injected transport that could drift
 * from production. Connections are closed by default, so nothing here can reach
 * the real `gateway.discord.gg`, and every server frame is scripted per test.
 */

const gateway = ws.link(`wss://gateway.discord.gg/*`);
const HEARTBEAT_INTERVAL = 45_000;

/** Frames the client sent us, parsed. */
interface Capture {
  frames: { op: number; d: unknown }[];
  /** Resolves once a frame with `op` arrives. */
  waitFor: (op: number) => Promise<{ op: number; d: unknown }>;
}

/**
 * Boot a synthetic gateway. `onConnect` receives the client handle plus a
 * capture of everything the client sends, so a test can assert on IDENTIFY /
 * RESUME / HEARTBEAT payloads.
 */
interface GatewayClient {
  send: (data: string) => void;
  close: (code?: number, reason?: string) => void;
}

interface Harness {
  server: ReturnType<typeof setupServer>;
  /** Resolves with the capture for the Nth connection (1-based). */
  connected: (n?: number) => Promise<Capture>;
  /** How many times a client has connected. */
  readonly count: number;
}

const withGateway = (
  onConnect: (ctx: { client: GatewayClient; capture: Capture }) => void
): Harness => {
  const captures: Capture[] = [];
  const connectionWaiters = new Map<number, (capture: Capture) => void>();

  const handler = gateway.addEventListener(`connection`, ({ client }) => {
    const frames: { op: number; d: unknown }[] = [];
    const waiters = new Map<
      number,
      (frame: { op: number; d: unknown }) => void
    >();

    client.addEventListener(`message`, (event: MessageEvent) => {
      if (typeof event.data !== `string`) return;
      const frame = JSON.parse(event.data) as { op: number; d: unknown };
      frames.push(frame);
      waiters.get(frame.op)?.(frame);
      waiters.delete(frame.op);
    });

    const capture: Capture = {
      frames,
      waitFor: async (op) =>
        new Promise((resolve) => {
          const existing = frames.find((f) => f.op === op);
          if (existing) {
            resolve(existing);
            return;
          }
          waiters.set(op, resolve);
        })
    };
    captures.push(capture);
    connectionWaiters.get(captures.length)?.(capture);
    connectionWaiters.delete(captures.length);

    // MSW's `client` is a class instance — `send`/`close` read `this.transport`,
    // so they must stay bound. Passing bare method references detaches them and
    // fails with "Cannot read properties of undefined (reading 'transport')".
    onConnect({
      client: {
        send: (data) => {
          client.send(data);
        },
        close: (code, reason) => {
          client.close(code, reason);
        }
      },
      capture
    });
  });

  const server = setupServer(handler);
  server.listen({ onUnhandledRequest: `error` });

  return {
    server,
    get count(): number {
      return captures.length;
    },
    // The `connection` listener fires on the event loop, after the synchronous
    // `connect()` returns — so tests must await this rather than read a
    // variable the listener is expected to have assigned by now.
    connected: async (n = 1) =>
      new Promise((resolve) => {
        const existing = captures[n - 1];
        if (existing) {
          resolve(existing);
          return;
        }
        connectionWaiters.set(n, resolve);
      })
  };
};

const hello = (interval = HEARTBEAT_INTERVAL): string =>
  JSON.stringify({
    op: GatewayOpcode.HELLO,
    d: { heartbeat_interval: interval }
  });

/**
 * Run `reply` once the client sends `op`. Rejections are surfaced rather than
 * swallowed — an unhandled one inside an MSW callback would otherwise leave the
 * test hanging until timeout with no indication of the cause.
 */
const afterFrame = (
  capture: Capture,
  op: GatewayOpcode,
  reply: () => void
): void => {
  void (async (): Promise<void> => {
    await capture.waitFor(op);
    reply();
  })();
};

const ready = (sessionId = `session-abc`): string =>
  JSON.stringify({
    op: GatewayOpcode.DISPATCH,
    t: `READY`,
    s: 1,
    d: {
      session_id: sessionId,
      resume_gateway_url: `wss://gateway.discord.gg/resume`
    }
  });

let harness: Harness | null = null;
let connection: GatewayConnection | null = null;

describe(`createConnection`, () => {
  afterEach(() => {
    connection?.close();
    connection = null;
    harness?.server.close();
    harness = null;
    vi.useRealTimers();
  });

  it(`identifies with the requested intents after HELLO`, async () => {
    harness = withGateway((ctx) => {
      ctx.client.send(hello());
    });

    connection = createConnection({
      token: `test-token`,
      intents: [`GUILDS`, `GUILD_MESSAGES`]
    });
    connection.connect();

    const capture = await harness.connected();
    const identify = await capture.waitFor(GatewayOpcode.IDENTIFY);
    const data = identify.d as { token: string; intents: number };
    expect(data.token).toBe(`test-token`);
    // GUILDS (1<<0) | GUILD_MESSAGES (1<<9) = 1 | 512 = 513. A wrong bitfield
    // means silently receiving no events, so pin the exact value.
    expect(data.intents).toBe(513);
  });

  it(`reaches ready and records the session id from READY`, async () => {
    harness = withGateway((ctx) => {
      ctx.client.send(hello());
      afterFrame(ctx.capture, GatewayOpcode.IDENTIFY, () => {
        ctx.client.send(ready(`session-xyz`));
      });
    });

    connection = createConnection({
      token: `test-token`,
      intents: [`GUILDS`]
    });
    connection.connect();

    await vi.waitFor(() => {
      expect(connection?.state).toBe(`ready`);
    });
    // The session id is what makes a later RESUME possible; losing it silently
    // downgrades every reconnect into a fresh identify.
    expect(connection?.sessionId).toBe(`session-xyz`);
  });

  it(`delivers dispatch events to subscribers`, async () => {
    let sendEvent!: (raw: string) => void;
    harness = withGateway((ctx) => {
      // `ctx.client.send` is already a closure that keeps `this` bound.
      sendEvent = ctx.client.send;
      ctx.client.send(hello());
      afterFrame(ctx.capture, GatewayOpcode.IDENTIFY, () => {
        ctx.client.send(ready());
      });
    });

    connection = createConnection({ token: `t`, intents: [`GUILD_MESSAGES`] });
    connection.connect();
    await vi.waitFor(() => {
      expect(connection?.state).toBe(`ready`);
    });

    const received: { type: string; data: unknown }[] = [];
    using _sub = connection.onDispatch((event) => {
      received.push(event);
    });

    sendEvent(
      JSON.stringify({
        op: GatewayOpcode.DISPATCH,
        t: `MESSAGE_CREATE`,
        s: 2,
        d: { content: `hello` }
      })
    );

    await vi.waitFor(() => {
      expect(received).toHaveLength(1);
    });
    expect(received[0]).toEqual({
      type: `MESSAGE_CREATE`,
      data: { content: `hello` }
    });
  });

  it(`responds immediately to a server-requested heartbeat`, async () => {
    let requestHeartbeat!: () => void;
    harness = withGateway((ctx) => {
      requestHeartbeat = (): void => {
        ctx.client.send(
          JSON.stringify({ op: GatewayOpcode.HEARTBEAT, d: null })
        );
      };
      ctx.client.send(hello());
      afterFrame(ctx.capture, GatewayOpcode.IDENTIFY, () => {
        ctx.client.send(ready());
      });
    });

    connection = createConnection({ token: `t`, intents: [`GUILDS`] });
    connection.connect();
    await vi.waitFor(() => {
      expect(connection?.state).toBe(`ready`);
    });

    requestHeartbeat();

    // Discord asks for an out-of-band heartbeat when it suspects the connection
    // is stale; not answering promptly gets the socket closed.
    const capture = await harness.connected();
    const beat = await capture.waitFor(GatewayOpcode.HEARTBEAT);
    // `d` carries the last sequence number seen — READY set it to 1.
    expect(beat.d).toBe(1);
  });

  it(`resumes with the session id and sequence after a resumable close`, async () => {
    let first = true;
    harness = withGateway((ctx) => {
      ctx.client.send(hello());
      if (first) {
        first = false;
        afterFrame(ctx.capture, GatewayOpcode.IDENTIFY, () => {
          ctx.client.send(ready(`session-resume`));
          // 4000 is resumable, so the client must RESUME rather than IDENTIFY.
          setTimeout(() => {
            ctx.client.close(4000, `transient`);
          }, 10);
        });
      }
    });

    connection = createConnection({ token: `t`, intents: [`GUILDS`] });
    connection.connect();

    // The second connection is the reconnect.
    const capture = await harness.connected(2);
    const resume = await capture.waitFor(GatewayOpcode.RESUME);
    const data = resume.d as { session_id: string; seq: number };
    // Resuming replays missed events. Identifying instead loses them AND burns
    // one of the limited daily session starts.
    expect(data.session_id).toBe(`session-resume`);
    expect(data.seq).toBe(1);
  });

  it(`stops reconnecting after a fatal close code`, async () => {
    harness = withGateway((ctx) => {
      // 4014 = disallowed intent. Retrying is an infinite loop that will fail
      // identically every time and burn the session start limit.
      ctx.client.close(4014, `Disallowed intent(s)`);
    });

    connection = createConnection({
      token: `t`,
      intents: [`MESSAGE_CONTENT`]
    });
    connection.connect();

    await vi.waitFor(() => {
      expect(connection?.state).toBe(`closed`);
    });
    // Give any (incorrectly) scheduled reconnect the chance to fire — the
    // minimum backoff is 1s, so wait past it.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    expect(harness.count).toBe(1);
  });

  it(`refuses to send before the socket is open`, () => {
    connection = createConnection({ token: `t`, intents: [`GUILDS`] });
    // Sending into a dead socket would throw an opaque DOM error; the message
    // should say what to do instead.
    expect(() =>
      connection?.send({ op: GatewayOpcode.HEARTBEAT, d: null })
    ).toThrow(/connect\(\)/);
  });
});
