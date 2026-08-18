import { describe, it, expect, afterEach, vi } from "vite-plus/test";
import { ws } from "msw";
import { setupServer } from "msw/node";
import {
  GatewayConnection,
  backoffDelay,
  closeAction,
  resolveToken,
  TOKEN_ENV_VAR
} from "../connection.js";
import { GatewayCloseCode } from "../types/GatewayCloseCode.js";
import { GatewayOpcode } from "../types/GatewayOpcode.js";
import { onMessageCreate } from "../events/messages/onMessageCreate.js";

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

describe(`gateway connection`, () => {
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

    connection = new GatewayConnection({
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

  it(`identifies with the intents its subscriptions registered`, async () => {
    // End-to-end proof of automatic registration: nothing names an intent, yet
    // the correct mask reaches the wire. GUILD_MESSAGES (1<<9) |
    // DIRECT_MESSAGES (1<<12) = 512 | 4096 = 4608.
    harness = withGateway((ctx) => {
      ctx.client.send(hello());
    });

    connection = new GatewayConnection({ token: `test-token` });
    const off = onMessageCreate(() => {}, { connection });
    connection.connect();

    const capture = await harness.connected();
    const identify = await capture.waitFor(GatewayOpcode.IDENTIFY);
    expect((identify.d as { intents: number }).intents).toBe(4608);
    off();
  });

  it(`adds setIntents on top of what subscriptions registered`, async () => {
    // MESSAGE_CONTENT gates message FIELDS rather than an event, so no handler
    // implies it. If setIntents replaced instead of added, asking for it would
    // silently drop the handler's own intents.
    harness = withGateway((ctx) => {
      ctx.client.send(hello());
    });

    connection = new GatewayConnection({ token: `test-token` });
    const off = onMessageCreate(() => {}, { connection });
    // Two separate calls: the second must not discard the first, which is what
    // "additive" has to mean for `setIntents` to compose with itself.
    connection.setIntents(`MESSAGE_CONTENT`);
    connection.setIntents(`GUILD_MEMBERS`);
    connection.connect();

    const capture = await harness.connected();
    const identify = await capture.waitFor(GatewayOpcode.IDENTIFY);
    // 4608 | MESSAGE_CONTENT (1<<15 = 32768) | GUILD_MEMBERS (1<<1 = 2) = 37378
    expect((identify.d as { intents: number }).intents).toBe(37378);
    off();
  });

  it(`refuses a subscription once connected`, async () => {
    // Discord reads intents only in IDENTIFY, so a handler added later would
    // never receive its event. Throwing beats delivering silence.
    harness = withGateway((ctx) => {
      ctx.client.send(hello());
      afterFrame(ctx.capture, GatewayOpcode.IDENTIFY, () => {
        ctx.client.send(ready(`session-late`));
      });
    });

    connection = new GatewayConnection({
      token: `test-token`,
      intents: [`GUILDS`]
    });
    connection.connect();
    await harness.connected();
    await vi.waitFor(() => {
      expect(connection?.state).toBe(`ready`);
    });

    expect(() =>
      onMessageCreate(() => {}, { connection: connection! })
    ).toThrow(/after connecting/);
    expect(() => connection?.setIntents(`GUILD_MEMBERS`)).toThrow(
      /after connecting/
    );
  });

  it(`reaches ready and records the session id from READY`, async () => {
    harness = withGateway((ctx) => {
      ctx.client.send(hello());
      afterFrame(ctx.capture, GatewayOpcode.IDENTIFY, () => {
        ctx.client.send(ready(`session-xyz`));
      });
    });

    connection = new GatewayConnection({
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

    connection = new GatewayConnection({
      token: `t`,
      intents: [`GUILD_MESSAGES`]
    });
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

  it(`delivers raw wire-shaped payloads to onDispatch`, async () => {
    let sendEvent!: (raw: string) => void;
    harness = withGateway((ctx) => {
      sendEvent = ctx.client.send;
      ctx.client.send(hello());
      afterFrame(ctx.capture, GatewayOpcode.IDENTIFY, () => {
        ctx.client.send(ready());
      });
    });

    connection = new GatewayConnection({
      token: `t`,
      intents: [`GUILD_MESSAGES`]
    });
    connection.connect();
    await vi.waitFor(() => {
      expect(connection?.state).toBe(`ready`);
    });

    const received: unknown[] = [];
    using _sub = connection.onDispatch((event) => {
      received.push(event.data);
    });

    // `onDispatch` is the raw firehose and hands back exactly what Discord
    // sent, in snake_case. Camelizing here would mean paying a recursive
    // deep-clone for every event whether or not anything consumed it; the
    // typed-event fan-out does it lazily instead (see dispatch.spec.ts).
    // It is also the honest contract for a tool inspecting wire traffic.
    sendEvent(
      JSON.stringify({
        op: GatewayOpcode.DISPATCH,
        t: `MESSAGE_CREATE`,
        s: 3,
        d: {
          channel_id: `123`,
          mention_everyone: false,
          author: { global_name: `nested` }
        }
      })
    );

    await vi.waitFor(() => {
      expect(received).toHaveLength(1);
    });
    expect(received[0]).toEqual({
      channel_id: `123`,
      mention_everyone: false,
      author: { global_name: `nested` }
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

    connection = new GatewayConnection({ token: `t`, intents: [`GUILDS`] });
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

    connection = new GatewayConnection({ token: `t`, intents: [`GUILDS`] });
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

    connection = new GatewayConnection({
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
    connection = new GatewayConnection({ token: `t`, intents: [`GUILDS`] });
    // Sending into a dead socket would throw an opaque DOM error; the message
    // should say what to do instead.
    expect(() =>
      connection?.send({ op: GatewayOpcode.HEARTBEAT, d: null })
    ).toThrow(/connect\(\)/);
  });

  it(`closes the socket when a \`using\` scope exits`, async () => {
    harness = withGateway((ctx) => {
      ctx.client.send(hello());
      afterFrame(ctx.capture, GatewayOpcode.IDENTIFY, () => {
        ctx.client.send(ready(`session-disposed`));
      });
    });

    // The point of Disposable: a connection scoped to a block must not outlive
    // it. Without dispose the socket stays open and the heartbeat keeps firing
    // after the code that owned it is gone — a leak that only shows up as a
    // stuck session much later.
    let observed: GatewayConnection | null = null;
    {
      using scoped = new GatewayConnection({
        token: `t`,
        intents: [`GUILDS`]
      });
      observed = scoped;
      scoped.connect();
      await vi.waitFor(() => {
        expect(scoped.state).toBe(`ready`);
      });
    }

    expect(observed.state).toBe(`closed`);
  });

  it(`stops reconnecting after being disposed`, async () => {
    harness = withGateway((ctx) => {
      // An unclean close would normally schedule a reconnect.
      ctx.client.close(4000, `Unknown error`);
    });

    {
      using scoped = new GatewayConnection({
        token: `t`,
        intents: [`GUILDS`]
      });
      scoped.connect();
      await vi.waitFor(() => {
        expect(harness?.count).toBe(1);
      });
    }

    // Dispose must cancel the pending reconnect, not merely close the socket —
    // otherwise the connection resurrects itself after the scope that owned it
    // has exited. Wait past the 1s minimum backoff.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    expect(harness.count).toBe(1);
  });
});

describe(`backoffDelay`, () => {
  it(`grows exponentially and then caps`, () => {
    // Exact values, because the growth curve is the contract: too shallow and
    // a reconnect storm hammers Discord during an outage, too steep and a bot
    // sits idle for minutes after a blip.
    expect(backoffDelay(0)).toBe(1_000);
    expect(backoffDelay(1)).toBe(2_000);
    expect(backoffDelay(4)).toBe(16_000);
    // Capped, so a long outage settles into steady retries rather than
    // backing off toward hours.
    expect(backoffDelay(5)).toBe(30_000);
    // Quoted in the package README.
    expect(backoffDelay(9)).toBe(30_000);
    expect(backoffDelay(50)).toBe(30_000);
  });
});

describe(`closeAction`, () => {
  it(`keeps the session across an unclean drop so it can resume`, () => {
    // The whole point of resuming: a dropped socket replays missed events and
    // costs no session start. Discarding here would silently downgrade every
    // network blip into a fresh IDENTIFY.
    expect(closeAction(4000)).toEqual({
      reconnect: true,
      discardSession: false
    });
  });

  it(`discards the session on a clean close`, () => {
    // 1000/1001 mean the session is gone server-side; resuming against it
    // would be rejected, so the next connection must IDENTIFY.
    expect(closeAction(1000)).toEqual({
      reconnect: true,
      discardSession: true
    });
    expect(closeAction(1001)).toEqual({
      reconnect: true,
      discardSession: true
    });
  });

  it(`discards the session when it timed out`, () => {
    expect(closeAction(GatewayCloseCode.SESSION_TIMED_OUT)).toEqual({
      reconnect: true,
      discardSession: true
    });
  });

  it(`stops entirely on a fatal close`, () => {
    // These fail identically on every retry. Reconnecting is an infinite loop
    // that burns the 1000/day session start limit — the most expensive bug
    // this module can have.
    for (const code of [
      GatewayCloseCode.AUTHENTICATION_FAILED,
      GatewayCloseCode.INVALID_INTENTS,
      GatewayCloseCode.DISALLOWED_INTENTS,
      GatewayCloseCode.INVALID_SHARD
    ]) {
      expect(closeAction(code)).toEqual({
        reconnect: false,
        discardSession: true
      });
    }
  });
});

describe(`resolveToken`, () => {
  // stubEnv restores on unstubAllEnvs, so a real DISCORD_BOT_TOKEN in the
  // developer's shell can't leak in and make these pass for the wrong reason.
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it(`prefers an explicit token over the environment`, () => {
    // Precedence matters for multi-bot processes: a second connection built
    // with its own token must not silently identify as the ambient one.
    vi.stubEnv(TOKEN_ENV_VAR, `from-env`);
    expect(resolveToken(`explicit`)).toBe(`explicit`);
  });

  it(`falls back to the environment when none is passed`, () => {
    vi.stubEnv(TOKEN_ENV_VAR, `from-env`);
    expect(resolveToken()).toBe(`from-env`);
  });

  it(`rejects an empty environment value rather than identifying with it`, () => {
    // An unset variable reads as `""` in many shells and CI configs. Passing
    // that through would spend a session start to earn an opaque 4004.
    vi.stubEnv(TOKEN_ENV_VAR, ``);
    expect(() => resolveToken()).toThrow(/No Discord bot token/);
  });

  it(`names both ways to supply a token when it finds none`, () => {
    // The message is the entire recovery path for this failure, so assert the
    // actionable parts rather than just that it threw.
    vi.stubEnv(TOKEN_ENV_VAR, undefined);
    expect(() => resolveToken()).toThrow(/GatewayConnection\({ token }\)/);
    expect(() => resolveToken()).toThrow(new RegExp(TOKEN_ENV_VAR));
  });

  it(`fails on connect(), not mid-handshake`, () => {
    // Validation happens at connect() rather than construction so a connection
    // can be built empty and configured by setters. It must still fail before
    // a socket opens, so the error names the mistake instead of arriving later
    // as an opaque 4004 close.
    vi.stubEnv(TOKEN_ENV_VAR, undefined);
    const connection = new GatewayConnection({ intents: [`GUILDS`] });
    expect(() => {
      connection.connect();
    }).toThrow(/No Discord bot token/);
    expect(connection.state).toBe(`idle`);
  });

  it(`refuses to connect with no intents`, () => {
    // An intentless IDENTIFY is legal but delivers almost nothing, which reads
    // as a dead bot rather than a misconfiguration — this library's worst
    // failure mode is silence.
    vi.stubEnv(TOKEN_ENV_VAR, `from-env`);
    const connection = new GatewayConnection();
    expect(() => {
      connection.connect();
    }).toThrow(/No intents were set/);
  });

  it(`accepts configuration through chainable setters`, () => {
    // Mirrors core's `discord.setToken(...)`: an instance you configure, not a
    // module-level function that hides where the config went.
    vi.stubEnv(TOKEN_ENV_VAR, undefined);
    const connection = new GatewayConnection();
    expect(connection.setToken(`t`).setIntents(`GUILDS`)).toBe(connection);
    expect(() => {
      connection.connect();
    }).not.toThrow();
    connection.close();
  });
});

describe(`server-initiated opcodes`, () => {
  let harness: Harness | null = null;
  let connection: GatewayConnection | null = null;

  afterEach(() => {
    connection?.close();
    connection = null;
    harness?.server.close();
    harness = null;
    vi.useRealTimers();
  });

  /** Bring a connection to `ready`, then hand back its capture. */
  const connected = async (
    onReadyFrame?: (ctx: { client: { send: (data: string) => void } }) => void
  ): Promise<Capture> => {
    harness = withGateway((ctx) => {
      ctx.client.send(hello());
      afterFrame(ctx.capture, GatewayOpcode.IDENTIFY, () => {
        ctx.client.send(ready());
        onReadyFrame?.(ctx);
      });
    });
    connection = new GatewayConnection({
      token: `test-token`,
      intents: [`GUILDS`]
    });
    connection.connect();
    const capture = await harness.connected();
    await vi.waitFor(() => {
      expect(connection?.state).toBe(`ready`);
    });
    return capture;
  };

  it(`heartbeats immediately when Discord asks`, async () => {
    // Opcode 1 is Discord saying "prove you're alive, now". Waiting for the
    // next scheduled beat instead risks being dropped as a zombie.
    const capture = await connected((ctx) => {
      ctx.client.send(JSON.stringify({ op: GatewayOpcode.HEARTBEAT, d: null }));
    });

    const beat = await capture.waitFor(GatewayOpcode.HEARTBEAT);
    // The last sequence seen, so Discord knows which events we have.
    expect(beat.d).toBe(1);
  });

  it(`reconnects and resumes when Discord sends RECONNECT`, async () => {
    // Opcode 7 means "close and come back", used during Discord's deploys.
    // The session must survive, so the client sends RESUME rather than
    // IDENTIFY — an IDENTIFY here would spend one of the 1000 daily starts.
    let connections = 0;
    let resumed = false;
    harness = withGateway((ctx) => {
      connections += 1;
      ctx.client.send(hello());
      if (connections === 1) {
        afterFrame(ctx.capture, GatewayOpcode.IDENTIFY, () => {
          ctx.client.send(ready());
          ctx.client.send(JSON.stringify({ op: GatewayOpcode.RECONNECT }));
        });
      } else {
        afterFrame(ctx.capture, GatewayOpcode.RESUME, () => {
          resumed = true;
        });
      }
    });
    connection = new GatewayConnection({
      token: `test-token`,
      intents: [`GUILDS`]
    });
    connection.connect();
    await harness.connected();

    await vi.waitFor(
      () => {
        expect(connections).toBeGreaterThan(1);
        expect(resumed).toBe(true);
      },
      { timeout: 5000 }
    );
  });

  it(`keeps the session when INVALID_SESSION says it is resumable`, async () => {
    // `d: true` means the session survives, so the id must be kept for RESUME.
    // Discarding it would spend a session start for nothing.
    await connected((ctx) => {
      ctx.client.send(
        JSON.stringify({ op: GatewayOpcode.INVALID_SESSION, d: true })
      );
    });

    await vi.waitFor(() => {
      expect(connection?.sessionId).toBe(`session-abc`);
    });
  });

  it(`discards the session when INVALID_SESSION says it is not`, async () => {
    // `d: false` means resuming would fail, so the next connection must
    // IDENTIFY fresh. Trying to RESUME on a dead session loops.
    await connected((ctx) => {
      ctx.client.send(
        JSON.stringify({ op: GatewayOpcode.INVALID_SESSION, d: false })
      );
    });

    await vi.waitFor(() => {
      expect(connection?.sessionId).toBeNull();
    });
  });

  it(`ignores a send-only opcode without breaking the connection`, async () => {
    // Discord never sends these. Receiving one signals a protocol change, but
    // it must not throw and kill a working session.
    await connected((ctx) => {
      ctx.client.send(
        JSON.stringify({ op: GatewayOpcode.REQUEST_GUILD_MEMBERS, d: {} })
      );
    });

    expect(connection?.state).toBe(`ready`);
  });

  it(`ignores a malformed frame`, async () => {
    // A non-JSON frame must not take the connection down; the socket is still
    // healthy and the next frame may be fine.
    await connected((ctx) => {
      ctx.client.send(`{not json`);
    });

    expect(connection?.state).toBe(`ready`);
  });
});
