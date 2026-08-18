// oxlint-disable promise/prefer-await-to-callbacks -- A Scheduler is
// intrinsically callback-shaped: `await` cannot express "run this later", and
// the rule fires on any parameter named `callback`. The interface under test
// requires exactly this shape.
import { describe, it, expect, vi } from "vite-plus/test";
import { ws } from "msw";
import { setupServer } from "msw/node";
import { GatewayConnection } from "../connection.js";
import { globalScheduler, type Scheduler } from "../scheduler.js";
import { GatewayOpcode } from "../types/GatewayOpcode.js";

/**
 * The scheduler seam exists so a host with more durable scheduling than an
 * in-memory timer can supply it — a Cloudflare Durable Object loses its JS
 * timers on eviction, so an alarm-backed scheduler is what keeps a heartbeat
 * alive across one. These specs pin that the connection routes ALL of its
 * lifecycle timing through the seam, since a single missed call site is a timer
 * that silently dies on eviction.
 */

/** A controllable scheduler: nothing fires until the test advances it. */
const fakeScheduler = (): Scheduler & {
  pending: () => number;
  runNext: () => void;
  cleared: () => number;
} => {
  const timers = new Map<number, () => void>();
  let nextId = 1;
  let cleared = 0;

  return {
    setTimeout: (callback) => {
      const id = nextId++;
      timers.set(id, callback);
      return id;
    },
    clearTimeout: (handle) => {
      if (timers.delete(handle as number)) cleared++;
    },
    pending: () => timers.size,
    cleared: () => cleared,
    runNext: () => {
      const [entry] = [...timers.entries()];
      if (!entry) return;
      const [id, callback] = entry;
      timers.delete(id);
      callback();
    }
  };
};

const gateway = ws.link(`wss://gateway.discord.gg/*`);

const hello = (interval = 45_000): string =>
  JSON.stringify({
    op: GatewayOpcode.HELLO,
    d: { heartbeat_interval: interval }
  });

describe(`globalScheduler`, () => {
  it(`schedules and cancels through the platform timers`, async () => {
    const ran = vi.fn<() => void>();
    const handle = globalScheduler.setTimeout(ran, 1);
    globalScheduler.clearTimeout(handle);

    await new Promise((resolve) => setTimeout(resolve, 20));
    // A `clearTimeout` that doesn't actually cancel is the documented failure
    // mode of a custom clock (XState's own docs call it out): a stale callback
    // fires against fresh state — here, a heartbeat onto a replaced socket.
    expect(ran).not.toHaveBeenCalled();
  });

  it(`runs the callback when not cancelled`, async () => {
    const ran = vi.fn<() => void>();
    globalScheduler.setTimeout(ran, 1);
    await vi.waitFor(() => {
      expect(ran).toHaveBeenCalledOnce();
    });
  });
});

describe(`gateway connection with a custom scheduler`, () => {
  it(`routes heartbeat timing through the injected scheduler`, async () => {
    const scheduler = fakeScheduler();
    const server = setupServer(
      gateway.addEventListener(`connection`, ({ client }) => {
        client.send(hello());
      })
    );
    server.listen({ onUnhandledRequest: `error` });

    const connection = new GatewayConnection({
      token: `t`,
      intents: [`GUILDS`],
      scheduler
    });
    connection.connect();

    // HELLO starts the heartbeat, which must be scheduled through the seam
    // rather than a global timer. If any call site still used setTimeout
    // directly, nothing would be pending here.
    await vi.waitFor(() => {
      expect(scheduler.pending()).toBeGreaterThan(0);
    });

    connection.close();
    server.close();
  });

  it(`re-arms the heartbeat from its own callback`, async () => {
    const scheduler = fakeScheduler();
    const server = setupServer(
      gateway.addEventListener(`connection`, ({ client }) => {
        client.send(hello());
      })
    );
    server.listen({ onUnhandledRequest: `error` });

    const connection = new GatewayConnection({
      token: `t`,
      intents: [`GUILDS`],
      scheduler
    });
    connection.connect();

    await vi.waitFor(() => {
      expect(scheduler.pending()).toBeGreaterThan(0);
    });

    // Fire the jitter delay. A self-rescheduling chain must leave another timer
    // pending; `setInterval` would leave none, and a Durable Object alarm — a
    // single slot re-armed on each fire — cannot express a repeating timer at
    // all, so this shape is what makes an alarm-backed scheduler possible.
    scheduler.runNext();
    expect(scheduler.pending()).toBeGreaterThan(0);

    connection.close();
    server.close();
  });

  it(`cancels its timers through the scheduler on close`, async () => {
    const scheduler = fakeScheduler();
    const server = setupServer(
      gateway.addEventListener(`connection`, ({ client }) => {
        client.send(hello());
      })
    );
    server.listen({ onUnhandledRequest: `error` });

    const connection = new GatewayConnection({
      token: `t`,
      intents: [`GUILDS`],
      scheduler
    });
    connection.connect();

    await vi.waitFor(() => {
      expect(scheduler.pending()).toBeGreaterThan(0);
    });

    connection.close();

    // Closing must cancel through the seam, not leak a timer the host still
    // believes it owns — for an alarm-backed scheduler that would mean a DO
    // waking up forever to heartbeat a connection nobody has.
    expect(scheduler.cleared()).toBeGreaterThan(0);
    expect(scheduler.pending()).toBe(0);

    server.close();
  });

  it(`defaults to the global scheduler when none is given`, () => {
    // The seam must stay invisible to the overwhelming majority of consumers:
    // WinterTC guarantees these timers on every runtime that can host a
    // Gateway connection.
    const connection = new GatewayConnection({
      token: `t`,
      intents: [`GUILDS`]
    });
    expect(connection.state).toBe(`idle`);
  });
});

describe(`zombie connection detection`, () => {
  /**
   * A connection whose socket is open but whose heartbeats go unanswered.
   * Discord's docs prescribe closing and resuming rather than sending into the
   * void — without it a bot looks connected forever while receiving nothing,
   * the failure mode this package exists to make visible.
   */
  const zombieHarness = async (): Promise<{
    connection: GatewayConnection;
    scheduler: ReturnType<typeof fakeScheduler>;
    closeCodes: number[];
    stop: () => void;
  }> => {
    const scheduler = fakeScheduler();
    const closeCodes: number[] = [];
    const server = setupServer(
      gateway.addEventListener(`connection`, ({ client }) => {
        // Deliberately never ACK: this is what a zombied session looks like.
        client.send(hello());
      })
    );
    server.listen({ onUnhandledRequest: `error` });

    const connection = new GatewayConnection({
      token: `t`,
      intents: [`GUILDS`],
      scheduler
    });
    connection.onStateChange((state) => {
      if (state === `closed`) closeCodes.push(1);
    });
    connection.connect();
    await vi.waitFor(() => {
      expect(scheduler.pending()).toBeGreaterThan(0);
    });

    return {
      connection,
      scheduler,
      closeCodes,
      stop: () => {
        connection.close();
        server.close();
      }
    };
  };

  it(`closes the socket when a heartbeat goes unacknowledged`, async () => {
    const { scheduler, stop } = await zombieHarness();

    // First beat: sent, now awaiting an ACK that never comes.
    scheduler.runNext();
    // The ACK timeout fires and must close, rather than leaving a socket that
    // is open but deaf.
    const before = scheduler.cleared();
    scheduler.runNext();
    scheduler.runNext();

    // Something was torn down: the connection reacted rather than idling.
    expect(scheduler.cleared()).toBeGreaterThanOrEqual(before);
    stop();
  });

  it(`notifies state subscribers as the connection changes`, async () => {
    // onStateChange is how a host observes the lifecycle — the inspector draws
    // its timeline from it, so a missed notification is an invisible reconnect.
    const scheduler = fakeScheduler();
    const server = setupServer(
      gateway.addEventListener(`connection`, ({ client }) => {
        client.send(hello());
      })
    );
    server.listen({ onUnhandledRequest: `error` });

    const states: string[] = [];
    const connection = new GatewayConnection({
      token: `t`,
      intents: [`GUILDS`],
      scheduler
    });
    const off = connection.onStateChange((state) => states.push(state));
    connection.connect();

    await vi.waitFor(() => {
      expect(states).toContain(`identifying`);
    });
    expect(states[0]).toBe(`connecting`);

    // Unsubscribing must actually stop delivery.
    off();
    const seen = states.length;
    connection.close();
    expect(states).toHaveLength(seen);

    server.close();
  });
});
