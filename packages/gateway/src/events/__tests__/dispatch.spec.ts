import { describe, it, expect, vi } from "vite-plus/test";
import * as v from "valibot";
import type { Guild } from "@discordkit/client/guild/types/Guild";
import { resolveIntents } from "../../connection.js";
import type { ConnectionLike, DispatchEvent } from "../../connection.js";
import { toSubscription, type Subscription } from "../../subscription.js";
import { dispatchEvent, intentsFor } from "../dispatch.js";
import { onGuildCreate } from "../guild/onGuildCreate.js";
import { onInteractionCreate } from "../interactions/onInteractionCreate.js";
import { onMessageCreate } from "../messages/onMessageCreate.js";
import { onReady } from "../lifecycle/onReady.js";
import { messageCreateSchema } from "../messages/types/MessageCreate.js";
import type { MessageCreate } from "../messages/types/MessageCreate.js";
import type { Ready } from "../lifecycle/types/Ready.js";

/**
 * A minimal fake connection. The real socket lifecycle is covered by
 * `connection.spec.ts` against MSW; here we only need to drive `onDispatch`,
 * so a stub keeps these tests about routing rather than about the transport.
 */
const fakeConnection = (): ConnectionLike & {
  emit: (event: DispatchEvent) => void;
  dispatchSubscriptions: () => number;
  registered: () => string[];
} => {
  const handlers = new Set<(event: DispatchEvent) => void>();
  const registered = new Set<string>();
  return {
    state: `idle`,
    sessionId: `s`,
    connect: () => {},
    close: () => {},
    send: () => {},
    registerIntents: ({ intents }) => {
      for (const intent of intents) registered.add(intent);
    },
    onStateChange: (): Subscription => toSubscription(() => {}),
    onError: (): Subscription => toSubscription(() => {}),
    onDispatch: (handler): Subscription => {
      handlers.add(handler);
      return toSubscription(() => {
        handlers.delete(handler);
      });
    },
    emit: (event) => {
      for (const handler of handlers) handler(event);
    },
    dispatchSubscriptions: () => handlers.size,
    registered: () => [...registered]
  };
};

describe(`dispatchEvent`, () => {
  it(`routes only its own event to a handler`, () => {
    const connection = fakeConnection();
    const messages = vi.fn<(data: MessageCreate) => void>();
    const guilds = vi.fn<(data: Guild) => void>();

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

    using _a = onMessageCreate(vi.fn<(data: MessageCreate) => void>(), {
      connection
    });
    using _b = onGuildCreate(vi.fn<(data: Guild) => void>(), { connection });
    using _c = onReady(vi.fn<(data: Ready) => void>(), { connection });

    // Three event types, ONE upstream subscription. Registering one per
    // subscriber would multiply the per-message work by the handler count.
    expect(connection.dispatchSubscriptions()).toBe(1);
  });

  it(`stops delivering after unsubscribe`, () => {
    const connection = fakeConnection();
    const handler = vi.fn<(data: MessageCreate) => void>();

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
    const handler = vi.fn<(data: MessageCreate) => void>();
    const off = onMessageCreate(handler, { connection });

    off();
    off();

    connection.emit({ type: `MESSAGE_CREATE`, data: {} });
    expect(handler).not.toHaveBeenCalled();
  });

  it(`camelizes the payload it hands to a typed handler`, () => {
    const connection = fakeConnection();
    const handler = vi.fn<(data: MessageCreate) => void>();
    using _sub = onMessageCreate(handler, { connection });

    // The connection delivers Discord's raw snake_case; the fan-out camelizes
    // so client's schemas match. Without it, reusing `messageSchema` fails on
    // every multi-word field — silently, since the payload is `unknown` until
    // a schema parses it.
    connection.emit({
      type: `MESSAGE_CREATE`,
      data: { channel_id: `1`, author: { global_name: `nested` } }
    });

    expect(handler).toHaveBeenCalledWith({
      channelId: `1`,
      // Nested objects too — `author.global_name` is as much a schema field.
      author: { globalName: `nested` }
    });
  });

  it(`does not camelize an event nobody subscribed to`, () => {
    const connection = fakeConnection();
    using _sub = onMessageCreate(vi.fn<(data: MessageCreate) => void>(), {
      connection
    });

    // The performance property: a busy guild floods PRESENCE_UPDATE and
    // TYPING_START that most bots never subscribe to. Transforming those was
    // ~79% of dispatch CPU at a realistic subscribe ratio, so the fan-out must
    // bail BEFORE the deep-clone rather than after.
    //
    // Detected via a getter: camelizing walks the payload with Object.entries,
    // so a read proves the transform ran. Asserting the input is "unchanged"
    // would prove nothing — toCamelKeys returns a copy and never mutates.
    const read = vi.fn<() => string>(() => `1`);
    const payload = {} as { user_id: string };
    Object.defineProperty(payload, `user_id`, {
      get: read,
      enumerable: true
    });

    connection.emit({ type: `PRESENCE_UPDATE`, data: payload });
    expect(read).not.toHaveBeenCalled();

    // Sanity check the probe itself: a SUBSCRIBED event must read it, or the
    // assertion above would pass for the wrong reason.
    connection.emit({ type: `MESSAGE_CREATE`, data: payload });
    expect(read).toHaveBeenCalledWith();
  });

  it(`delivers to every subscriber of the same event`, () => {
    const connection = fakeConnection();
    const first = vi.fn<(data: MessageCreate) => void>();
    const second = vi.fn<(data: MessageCreate) => void>();

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

describe(`resolveIntents`, () => {
  it(`accepts handlers directly, so the mask can't drift`, () => {
    // The ergonomic win: `new GatewayConnection({ intents: [onMessageCreate] })`
    // derives the mask from what the bot actually consumes, rather than a
    // hand-maintained list that silently rots as handlers change.
    expect(resolveIntents([onMessageCreate, onGuildCreate])).toEqual([
      `GUILD_MESSAGES`,
      `DIRECT_MESSAGES`,
      `GUILDS`
    ]);
  });

  it(`still accepts plain intent names`, () => {
    expect(resolveIntents([`GUILDS`, `MESSAGE_CONTENT`])).toEqual([
      `GUILDS`,
      `MESSAGE_CONTENT`
    ]);
  });

  it(`mixes names and handlers in one list`, () => {
    // MESSAGE_CONTENT gates message FIELDS rather than an event, so no handler
    // reports it — mixing is how you add it alongside derived intents.
    expect(resolveIntents([onMessageCreate, `MESSAGE_CONTENT`])).toEqual([
      `GUILD_MESSAGES`,
      `DIRECT_MESSAGES`,
      `MESSAGE_CONTENT`
    ]);
  });

  it(`deduplicates an intent several sources share`, () => {
    expect(resolveIntents([onGuildCreate, `GUILDS`])).toEqual([`GUILDS`]);
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

describe(`automatic intent registration`, () => {
  it(`registers an event's intents when you subscribe`, () => {
    // The whole point: the mask comes from the handlers a bot actually uses,
    // so it cannot drift as handlers are added or removed.
    const connection = fakeConnection();
    onMessageCreate(() => {}, { connection });

    expect(connection.registered()).toEqual(
      expect.arrayContaining([`GUILD_MESSAGES`, `DIRECT_MESSAGES`])
    );
  });

  it(`unions the intents of every subscribed event`, () => {
    const connection = fakeConnection();
    onMessageCreate(() => {}, { connection });
    onGuildCreate(() => {}, { connection });

    expect(connection.registered()).toEqual(
      expect.arrayContaining([`GUILD_MESSAGES`, `DIRECT_MESSAGES`, `GUILDS`])
    );
  });

  it(`registers nothing for an event Discord always delivers`, () => {
    // READY is not gated by any intent, so it must not contribute one — an
    // empty registration would otherwise look like a configured connection.
    const connection = fakeConnection();
    onReady(() => {}, { connection });

    expect(connection.registered()).toEqual([]);
  });
});
