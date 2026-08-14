import { describe, it, expect, vi } from "vite-plus/test";
import * as v from "valibot";
import type { DispatchEvent, GatewayConnection } from "../../connection.js";
import { toSubscription, type Subscription } from "../../subscription.js";
import { dispatchEvent, intentsFor } from "../dispatch.js";
import { onGuildCreate } from "../onGuildCreate.js";
import { onInteractionCreate } from "../onInteractionCreate.js";
import { onMessageCreate } from "../onMessageCreate.js";
import { onReady } from "../onReady.js";
import { messageCreateSchema } from "../types/MessageCreate.js";

/**
 * A minimal fake connection. The real socket lifecycle is covered by
 * `connection.spec.ts` against MSW; here we only need to drive `onDispatch`,
 * so a stub keeps these tests about routing rather than about the transport.
 */
const fakeConnection = (): GatewayConnection & {
  emit: (event: DispatchEvent) => void;
  dispatchSubscriptions: () => number;
} => {
  const handlers = new Set<(event: DispatchEvent) => void>();
  return {
    state: `ready`,
    sessionId: `s`,
    connect: () => {},
    close: () => {},
    send: () => {},
    onStateChange: (): Subscription => toSubscription(() => {}),
    onDispatch: (handler): Subscription => {
      handlers.add(handler);
      return toSubscription(() => {
        handlers.delete(handler);
      });
    },
    emit: (event) => {
      for (const handler of handlers) handler(event);
    },
    dispatchSubscriptions: () => handlers.size
  };
};

describe(`dispatchEvent`, () => {
  it(`routes only its own event to a handler`, () => {
    const connection = fakeConnection();
    const messages = vi.fn();
    const guilds = vi.fn();

    using _m = onMessageCreate(messages, { connection });
    using _g = onGuildCreate(guilds, { connection });

    connection.emit({ type: `MESSAGE_CREATE`, data: { content: `hi` } });

    // Routing on `t` is the whole point of the fan-out: a bot subscribing to
    // two events must not see one delivered to the other's handler.
    expect(messages).toHaveBeenCalledWith({ content: `hi` });
    expect(guilds).not.toHaveBeenCalled();
  });

  it(`opens exactly one dispatch subscription per connection`, () => {
    const connection = fakeConnection();

    using _a = onMessageCreate(vi.fn(), { connection });
    using _b = onGuildCreate(vi.fn(), { connection });
    using _c = onReady(vi.fn(), { connection });

    // Three event types, ONE upstream subscription. Registering one per
    // subscriber would multiply the per-message work by the handler count.
    expect(connection.dispatchSubscriptions()).toBe(1);
  });

  it(`stops delivering after unsubscribe`, () => {
    const connection = fakeConnection();
    const handler = vi.fn();

    const off = onMessageCreate(handler, { connection });
    connection.emit({ type: `MESSAGE_CREATE`, data: { content: `first` } });
    off();
    connection.emit({ type: `MESSAGE_CREATE`, data: { content: `second` } });

    // A handler that keeps firing after unsubscribe leaks work and, worse,
    // can act on events the caller believes it stopped listening for.
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it(`is idempotent on repeated unsubscribe`, () => {
    const connection = fakeConnection();
    const handler = vi.fn();
    const off = onMessageCreate(handler, { connection });

    off();
    off();

    connection.emit({ type: `MESSAGE_CREATE`, data: {} });
    expect(handler).not.toHaveBeenCalled();
  });

  it(`delivers to every subscriber of the same event`, () => {
    const connection = fakeConnection();
    const first = vi.fn();
    const second = vi.fn();

    using _a = onMessageCreate(first, { connection });
    using _b = onMessageCreate(second, { connection });

    connection.emit({ type: `MESSAGE_CREATE`, data: { content: `x` } });

    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });
});

describe(`event intent metadata`, () => {
  it(`carries the intents that gate each event`, () => {
    // Generated from the docs' intent list. Getting these wrong means either a
    // fatal 4014 (over-requesting a privileged intent) or events that never
    // arrive with no error at all (under-requesting).
    expect(onMessageCreate.intents).toEqual([
      `GUILD_MESSAGES`,
      `DIRECT_MESSAGES`
    ]);
    expect(onGuildCreate.intents).toEqual([`GUILDS`]);
  });

  it(`reports no intents for always-delivered events`, () => {
    // READY and INTERACTION_CREATE aren't in the docs' intent list at all —
    // Discord always sends them. Claiming an intent here would make a bot
    // request more than it needs.
    expect(onReady.intents).toEqual([]);
    expect(onInteractionCreate.intents).toEqual([]);
  });

  it(`exposes the wire event name`, () => {
    expect(onMessageCreate.event).toBe(`MESSAGE_CREATE`);
    expect(onReady.event).toBe(`READY`);
  });

  it(`falls back to no intents for an unknown event`, () => {
    // Guards codegen drift: an event name absent from EVENT_INTENTS must not
    // throw at module scope, since `dispatchEvent` runs at import time.
    const custom = dispatchEvent<unknown, `NOT_A_REAL_EVENT`>(
      `NOT_A_REAL_EVENT`
    );
    expect(custom.intents).toEqual([]);
  });
});

describe(`intentsFor`, () => {
  it(`unions the intents of the handlers a bot actually uses`, () => {
    // The point is an exact mask: everything needed, nothing more.
    expect(intentsFor(onMessageCreate, onGuildCreate)).toEqual([
      `GUILD_MESSAGES`,
      `DIRECT_MESSAGES`,
      `GUILDS`
    ]);
  });

  it(`deduplicates intents shared by several events`, () => {
    // MESSAGE_CREATE and MESSAGE_UPDATE share GUILD_MESSAGES; a duplicated
    // entry would still OR correctly, but the list is user-facing.
    expect(intentsFor(onMessageCreate, onMessageCreate)).toEqual([
      `GUILD_MESSAGES`,
      `DIRECT_MESSAGES`
    ]);
  });

  it(`returns nothing for events that need no intent`, () => {
    expect(intentsFor(onReady, onInteractionCreate)).toEqual([]);
  });
});

describe(`messageCreateSchema`, () => {
  it(`accepts a message plus the documented extra fields`, () => {
    // Discord documents MESSAGE_CREATE as "a message object with the following
    // extra fields", so the schema composes client's messageSchema rather than
    // redefining it — this pins that composition.
    const payload = {
      id: `1`,
      channelId: `2`,
      author: {
        id: `3`,
        username: `u`,
        discriminator: `0001`,
        avatar: null,
        globalName: null
      },
      content: `hi`,
      timestamp: `2026-08-14T00:00:00.000000+00:00`,
      editedTimestamp: null,
      tts: false,
      mentionEveryone: false,
      mentions: [],
      mentionRoles: [],
      attachments: [],
      embeds: [],
      pinned: false,
      type: 0,
      flags: 0,
      // The extra fields:
      guildId: `4`,
      channelType: 0
    };

    const result = v.safeParse(messageCreateSchema, payload);
    expect(
      result.success
        ? []
        : result.issues.map(
            (i) =>
              `${i.path?.map((p) => String(p.key)).join(`.`) ?? `?`}: ${i.message}`
          )
    ).toEqual([]);
  });

  it(`rejects a payload in Discord's raw snake_case wire format`, () => {
    // The connection camelizes dispatch payloads at the transport boundary
    // (mirroring core's request.ts) precisely so client schemas match. If that
    // transform is ever dropped, this schema stops matching real traffic — and
    // it would fail SILENTLY, since the payload is `unknown` until parsed.
    const wire = {
      id: `1`,
      channel_id: `2`,
      author: { id: `3`, username: `u` },
      content: `hi`,
      mention_everyone: false
    };
    const result = v.safeParse(messageCreateSchema, wire);
    expect(result.success).toBe(false);
  });
});
