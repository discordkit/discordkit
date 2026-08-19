<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-dark.svg">
  <img alt="Discordkit" src="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-light.svg">
</picture>

[![npm version][npm_badge]][npm] [![jsr version][jsr_badge]][jsr] [![CI status][ci_badge]][ci]

A tree-shakeable Discord [Gateway][gateway_docs] (WebSocket) client for Cloudflare Workers, Durable Objects, and Node.

</div>

---

## 📦 Installation

```sh
yarn add @discordkit/gateway valibot
```

`valibot` is a peer dependency, shared with the rest of discordkit.

## 🔧 Quickstart

Here is a minimal example gateway application: reply to `!ping` with `Pong!`.

```ts
import { gateway, onMessageCreate } from "@discordkit/gateway";
import { createMessage } from "@discordkit/client";

onMessageCreate(async (message) => {
  if (message.content !== `!ping`) return;
  await createMessage({
    channel: message.channelId,
    body: { content: `Pong!` }
  });
});

gateway.setIntents(`MESSAGE_CONTENT`).connect();
```

Both clients read `DISCORD_BOT_TOKEN` from the environment, so a bot needs no setup beyond `.env`. Call `gateway.setToken()` or `discord.setToken()` to pass one explicitly, which runtimes without `process.env` must do.

Subscribing registers what an event needs, so `onMessageCreate` already asked for `GUILD_MESSAGES` and `DIRECT_MESSAGES`. Only `MESSAGE_CONTENT` is named here, because it gates message _fields_ rather than an event, so no handler implies it.

Replies go over REST because the Gateway cannot send messages. It is bidirectional, but the only payloads a client may send are presence updates, voice state, and requests for guild members, soundboard sounds, or channel info. Sending a message is an HTTP call.

Two things differ from other libraries. Intents come from the handlers themselves, so the mask cannot drift from what the bot reads. And `onMessageCreate` is an ordinary import, so a bot that never touches presences never pays for `PRESENCE_UPDATE`.

### What that bot costs

The same bot, bundled with rolldown for Node and minified:

|                     |       discordkit | discord.js 14.27 |
| ------------------- | ---------------: | ---------------: |
| Bundle              |     **32.4 KiB** |       1264.4 KiB |
| Gzipped             |     **11.1 KiB** |        334.6 KiB |
| `node_modules`      | 1.8 MB (valibot) |            24 MB |
| Direct dependencies |                1 |               15 |

The gap is the design, not compression: a monolithic `new Client()` registers every event, so a ping bot links the voice, sharding, and caching code it never calls. Here each event is a separate module, so the bundler drops the 78 events this bot does not import.

## Dispatch coverage

All **79 dispatchable events** are typed and tested, grouped by resource (`events/messages/`, `events/guild/`, …) the way `@discordkit/client` organizes its endpoints. A [coverage guard](src/events/__tests__/coverage.spec.ts) fails the build when a docs refresh adds an event that nobody wired up.

Discord's docs list 84 items under _Receive Events_. Five of them are not dispatchable. `HELLO`, `RECONNECT`, and `INVALID_SESSION` are lifecycle **opcodes** that arrive with no `t` field. The connection handles them internally, and `onStateChange` reports the result. `CLIENT_STATUS_OBJECT` and `ACTIVITY_OBJECT` are structure definitions that share a heading level with real events.

## Design

**You only import what you need.** Other JavaScript Discord libraries provide an object-oriented monolith. There, `new Client()` pulls in the entire event surface whether you use it or not. Here, each event is its own module and its own export. Importing one event never pulls in another's registration.

The runtime target is the **Workers/Durable Object contract**: the Web-standard global `WebSocket`, with no Node-only dependency on the hot path. The same code runs unchanged on Node 22+, which provides that global.

## 🔧 Usage

### The connection

`gateway` is the default connection, the way `discord` is the default REST session. Configure it, then open it:

```ts
import { gateway } from "@discordkit/gateway";

gateway.setToken(token).setIntents(`GUILDS`).connect();
```

`setToken` is optional: without it the connection reads `DISCORD_BOT_TOKEN` from the environment. Runtimes with no `process.env`, such as Cloudflare Workers, must set it from their binding.

`connect()` throws when it has no token, and when no intents are set. Both are configuration mistakes that would otherwise surface as a `4004` close or as a bot that receives nothing.

Importing this package never opens a connection. Nothing calls Discord until `connect()`.

Construct your own when one process needs several sockets, or when module globals are the wrong scope. A Durable Object is the motivating case, since globals there are per-isolate:

```ts
const connection = new GatewayConnection({ token, intents: [`GUILDS`] });
connection.connect();
```

Code that only _uses_ a connection can accept `ConnectionLike` instead of the class. That interface is the structural surface: `state`, `sessionId`, `connect`, `close`, `send`, `onDispatch`, and `onStateChange`. A test can pass a stub without constructing a real socket owner.

### Subscribing to events

Each event is its own module and its own export. Subscriptions attach to `gateway` unless told otherwise:

```ts
import { onMessageCreate, onReady } from "@discordkit/gateway";

onReady(({ user }) => {
  console.log(`Logged in as ${user.username}`);
});

onMessageCreate((message) => {
  if (message.author.bot) return;
  console.log(message.content);
});
```

Handlers may be `async`. The fan-out does not await them, so catch your own rejections.

Pass `{ connection }` to target another instance:

```ts
onMessageCreate(handler, { connection });
```

Subscribing returns a function that unsubscribes. Most bots listen for as long as they run, so the return value is usually ignored. Keep it only to stop early:

```ts
const off = onMessageCreate(handler);
off(); // stop listening; the connection stays open
```

It is also a `Disposable`, so `using` works where a subscription really is scoped to a block, such as a test. Take care with `using` in application code: it unsubscribes at the end of the **enclosing block**, so a subscription set up inside `main()` stops when `main()` returns.

For an event with no typed module yet, `connection.onDispatch` delivers every event by wire name:

```ts
connection.onDispatch((event) => {
  if (event.type === `TYPING_START`) {
    // …
  }
});
```

### Let your handlers declare your intents

Each subscriber carries the intents Discord requires for its event. Pass the handlers themselves and the connection derives the exact mask:

```ts
import { gateway, onMessageCreate, onGuildCreate } from "@discordkit/gateway";

gateway.setIntents(onMessageCreate, onGuildCreate);
// => GUILD_MESSAGES | DIRECT_MESSAGES | GUILDS
```

Names and handlers mix freely. You need this for `MESSAGE_CONTENT`, which gates message _fields_ rather than an event, so no handler reports it:

```ts
gateway.setIntents(onMessageCreate, `MESSAGE_CONTENT`);
```

Both directions of error are costly. Under-requesting fails **silently**: the events never arrive. Over-requesting a privileged intent you have not been granted is a fatal `4014`. A mask derived from the handlers cannot drift as you add or remove them.

`intentsFor(...)` returns the resolved list as a value.

### Intents

Intents are bitwise flags that declare which events you want. Requesting none of an intent's events means receiving none of them.

```ts
import {
  intents,
  GatewayIntents,
  PRIVILEGED_INTENTS
} from "@discordkit/gateway";

intents(`GUILDS`, `GUILD_MESSAGES`); // 513
```

Three intents are **privileged** and must be enabled in the Developer Portal. Apps in 100 or more guilds also need approval after verification. The three are `GUILD_PRESENCES`, `GUILD_MEMBERS`, and `MESSAGE_CONTENT`.

> [!WARNING]
>
> `MESSAGE_CONTENT` gates message **fields**, not whole events. Without it, `MESSAGE_CREATE` still arrives, but `content`, `embeds`, `attachments`, `components`, and `poll` are **empty**. Nothing throws. When messages look blank, check this intent first.

Requesting a privileged intent you have not been granted closes the connection with `4014`. This is fatal, so the client stops instead of reconnecting. A retry would fail the same way and spend the daily session start limit.

## Scheduling: two timescales, two mechanisms

**Connection-lifecycle timing runs in-process.** The heartbeat (~41s), its ACK timeout, the identify jitter, and the reconnect backoff run on timers. Those timers live inside the process that holds the socket. Three constraints force this:

- **Cron cannot go below one minute.** Inngest, Trigger.dev, and Vercel Cron are cron-expression based. A 41-second heartbeat is not expressible.
- **Durable execution engines cannot hold a socket.** Temporal, Inngest, Trigger.dev, and Vercel Workflow replay _steps_ deterministically. A live connection cannot survive replay or suspension.
- **The "heartbeat pattern" is a different thing.** Cron waking a process to do work and sleep again assumes the process is stateless between wakes. Here the socket **is** the state.

**Application scheduling belongs on your platform.** Session cleanup, leaderboard rollups, scheduled posts, digest jobs, and supervision after an outage all run on the minutes-to-months timescale. Use cron or a durable-execution platform for them. This package ships no helpers for that work: a `setTimeout` per quiz session becomes in-memory bloat past a handful, and it dies with the process.

| Timescale                            | Examples                                          | Mechanism                                          |
| ------------------------------------ | ------------------------------------------------- | -------------------------------------------------- |
| Sub-minute, connection lifecycle     | heartbeat, ACK timeout, jitter, reconnect backoff | in-process timers (this package)                   |
| Minutes to months, application logic | cleanup, rollups, scheduled posts, retries        | cron / Inngest / Trigger.dev / Temporal / Workflow |

### Customising connection timers

The `Scheduler` seam serves hosts that can schedule **more durably** than an in-memory timer. It does not move heartbeats off-process, which is not possible.

```ts
export interface Scheduler {
  setTimeout: (callback: () => void, ms: number) => unknown;
  clearTimeout: (handle: unknown) => void;
}
```

The default uses the platform's global timers, which [WinterTC's Minimum Common API](https://wintertc.org/) guarantees on every runtime that can host a Gateway connection. **Most consumers never set this.**

A Cloudflare Durable Object is the motivating case. A DO loses its JS timers on eviction, so a `setTimeout`-driven heartbeat stops and the session dies. A DO alarm survives eviction and wakes the object. [`examples/with-cloudflare`](../../examples/with-cloudflare) implements that in about 40 lines, including the part that is not obvious: multiplexing several pending timers onto a DO's single, non-repeating alarm slot.

The seam also makes timing testable. A fake scheduler drives heartbeat and backoff behaviour with no real waiting.

## Where a Gateway connection can live

Not every serverless host can hold one:

| Host                                                             | Connection lifetime                            | Verdict                                                  |
| ---------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| Cloudflare Durable Objects, celld, a container (Railway/Fly/VPS) | unbounded                                      | ✅ the real targets                                      |
| Vercel Fluid Services                                            | bounded by `maxDuration` — 800s, 1800s in beta | ⚠️ works, but cycles every 13–30 min                     |
| Vercel Functions, Inngest, Trigger.dev, Temporal                 | invocation-scoped or replay-based              | ❌ cannot hold a socket; ideal for the work _around_ one |

The middle row is the trap. Vercel Fluid does keep WebSockets open, but `maxDuration` caps every connection, so a Gateway session cycles every 13–30 minutes forever. Each cycle likely means a fresh `IDENTIFY` rather than a `RESUME`, and Discord allows **1000 session starts per day**. Staying connected would spend the whole budget before any real reconnect, deploy, or Discord-side outage. Events drop in each gap.

## Connection lifecycle

The client implements the full documented lifecycle:

- **Identify / Resume** — after a recoverable drop, resumes with the session id and sequence number, which replays missed events instead of losing them.
- **Heartbeat** — the first beat is delayed by `heartbeat_interval * random()`. Discord asks for this jitter so bots do not stampede after a deploy. A missing `HEARTBEAT_ACK` marks the connection as zombied.
- **Reconnect** — exponential backoff from 1s to 30s, and **no** reconnect after a fatal close (`4004` bad token, `4010` invalid shard, `4013`/`4014` intents).

Both decisions are exported as pure functions, so you can assert the policy without driving a socket into each state:

```ts
import { backoffDelay, closeAction } from "@discordkit/gateway";

backoffDelay(0); // 1000
backoffDelay(9); // 30000 — capped

closeAction(4000); // { reconnect: true,  discardSession: false } — resume
closeAction(1000); // { reconnect: true,  discardSession: true  } — fresh identify
closeAction(4014); // { reconnect: false, discardSession: true  } — give up
```

`closeAction` carries the highest consequence in the client. One wrong direction reconnect-loops through the 1000/day session-start budget. The other stops a bot with no error.

## 🔗 Related packages

- [`@discordkit/client`](../client) — the REST API, including `getGateway` and `getGatewayBot` for the WSS URL, recommended shard count, and session start limits.
- [`@discordkit/core`](../core) — the shared request/validation layer.
- [`@discordkit/native`](../native) — the Discord Social SDK for desktop apps.

## 🥂 License

[MIT][license] © [Drake Costa][personal-website]

[npm_badge]: https://img.shields.io/npm/v/@discordkit/gateway.svg?style=flat
[npm]: https://www.npmjs.com/package/@discordkit/gateway
[jsr_badge]: https://img.shields.io/jsr/v/@discordkit/gateway
[jsr]: https://jsr.io/@discordkit/gateway
[ci_badge]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml/badge.svg
[ci]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml
[license]: https://github.com/discordkit/discordkit/blob/main/LICENSE.md
[personal-website]: https://saeris.gg
[gateway_docs]: https://discord.com/developers/docs/events/gateway
[discord_api]: https://discord.com/developers/docs
