import { describe, it, expect, afterEach, vi } from "vite-plus/test";
import { ws } from "msw";
import { setupServer } from "msw/node";
import { GatewayConnection } from "../connection.js";
import { GatewayOpcode } from "../types/GatewayOpcode.js";
import { onMessageCreate } from "../events/messages/onMessageCreate.js";

/**
 * Sharding is deferred, not precluded. These pin the properties a future shard
 * manager would be built on, so a regression shows up here rather than as a
 * breaking change when that work lands.
 */

const gateway = ws.link(`wss://gateway.discord.gg/*`);

const hello = (): string =>
  JSON.stringify({
    op: GatewayOpcode.HELLO,
    d: { heartbeat_interval: 45_000 }
  });

let server: ReturnType<typeof setupServer> | null = null;
const opened: GatewayConnection[] = [];

/**
 * Shared teardown. Called from each block's own `afterEach` rather than a
 * top-level hook, which `vitest/require-top-level-describe` forbids.
 */
const cleanup = (): void => {
  for (const c of opened) c.close();
  opened.length = 0;
  server?.close();
  server = null;
  vi.useRealTimers();
};

describe(`multiple connections`, () => {
  afterEach(cleanup);

  it(`identifies each shard with its own shard array`, async () => {
    const identifies: unknown[] = [];
    server = setupServer(
      gateway.addEventListener(`connection`, ({ client }) => {
        client.addEventListener(`message`, (event: MessageEvent) => {
          if (typeof event.data !== `string`) return;
          const frame = JSON.parse(event.data) as {
            op: GatewayOpcode;
            d: unknown;
          };
          if (frame.op === GatewayOpcode.IDENTIFY) identifies.push(frame.d);
        });
        client.send(hello());
      })
    );
    server.listen({ onUnhandledRequest: `error` });

    const total = 2;
    for (let id = 0; id < total; id++) {
      const connection = new GatewayConnection({
        token: `t`,
        intents: [`GUILDS`],
        shard: [id, total]
      });
      opened.push(connection);
      connection.connect();
    }

    await vi.waitFor(() => {
      expect(identifies).toHaveLength(2);
    });
    const shards = identifies.map((d) => (d as { shard: number[] }).shard);
    expect(shards).toEqual(
      expect.arrayContaining([
        [0, 2],
        [1, 2]
      ])
    );
  });

  it(`keeps handlers and intents isolated per connection`, () => {
    // The property a shard manager depends on: a handler registered against
    // one connection must not fire for another, and must not contribute its
    // intents there either. Shared state here would cross-deliver events.
    const a = new GatewayConnection({ token: `t` });
    const b = new GatewayConnection({ token: `t`, intents: [`GUILDS`] });

    onMessageCreate(() => {}, { connection: a });

    expect(a.intents).toEqual(
      expect.arrayContaining([`GUILD_MESSAGES`, `DIRECT_MESSAGES`])
    );
    expect(b.intents).toEqual([`GUILDS`]);
  });
});

describe(`unsupported frame encodings`, () => {
  afterEach(cleanup);

  it(`reports a binary frame instead of dropping it`, async () => {
    // A silently ignored frame is the worst outcome here: the bot connects,
    // receives nothing, and reports no error. Compression and ETF both arrive
    // as binary, so this is the tripwire for "the encoding assumption broke".
    const errors: string[] = [];
    server = setupServer(
      gateway.addEventListener(`connection`, ({ client }) => {
        client.send(hello());
        client.send(new TextEncoder().encode(`compressed-ish`));
      })
    );
    server.listen({ onUnhandledRequest: `error` });

    const onError = (event: { message?: string; reason?: unknown }): void => {
      errors.push(String(event.message ?? event.reason));
    };
    process.on(`uncaughtException`, onError);
    process.on(`unhandledRejection`, onError);

    const connection = new GatewayConnection({
      token: `t`,
      intents: [`GUILDS`]
    });
    opened.push(connection);
    connection.connect();

    await vi.waitFor(() => {
      expect(errors.some((e) => e.includes(`binary Gateway frame`))).toBe(true);
    });

    process.off(`uncaughtException`, onError);
    process.off(`unhandledRejection`, onError);
  });
});
