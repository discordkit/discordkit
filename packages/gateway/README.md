# @discordkit/gateway

A tree-shakeable Discord **Gateway** (WebSocket) client for Cloudflare Workers, Durable Objects, and Node.

The Gateway is how a Discord app receives real-time events — messages, interactions, guild updates — as they happen. HTTP Interactions can deliver component and command callbacks, but only a Gateway connection can see ordinary channel messages, which is what makes "watch the channel and react" bots possible.

> **Status: v0.** Connection lifecycle, dispatch subscription, and the lifecycle-critical typed events are implemented and tested. The remaining ~79 dispatch events land in reviewed batches; until then, `connection.onDispatch` gives you every event by wire name.

## Installation

```sh
yarn add @discordkit/gateway valibot
```

`valibot` is a peer dependency, shared with the rest of discordkit.

## Design

**You only import what you need.** Other JavaScript Discord libraries hand you an object-oriented monolith where `new Client()` pulls in the entire event surface whether you use it or not. Here, each event is its own module and its own export, so importing one never drags in another's registration.

The runtime target is the **Workers/Durable Object contract**: the Web-standard global `WebSocket`, with no Node-only dependency on the hot path. That runs unchanged on Node 22+, which provides the same global.

## Usage

### Ambient connection

Mirrors `@discordkit/native`: configure once, subscribe anywhere.

```ts
import { configure, connect } from "@discordkit/gateway";

// Safe at module scope — stores config, opens nothing.
configure({
  token: process.env.DISCORD_BOT_TOKEN,
  intents: [`GUILDS`, `GUILD_MESSAGES`, `MESSAGE_CONTENT`]
});

connect(); // opens the socket
```

Importing this package never opens a connection. Nothing dials Discord until you call `connect()`.

### Explicit connection

In a Durable Object, skip the ambient singleton — module globals are per-isolate, so each instance should own its socket:

```ts
import { createConnection } from "@discordkit/gateway";

const connection = createConnection({ token, intents: [`GUILDS`] });
connection.connect();
```

Every subscription accepts `{ connection }` to target a specific instance.

### Subscribing to events

Each event is its own module and its own export:

```ts
import { onMessageCreate, onReady } from "@discordkit/gateway";

using ready = onReady(({ user }) => {
  console.log(`Logged in as ${user.username}`);
});

using messages = onMessageCreate((message) => {
  if (message.author.bot) return;
  console.log(message.content);
});
```

Subscriptions are `(() => void) & Disposable` — the same shape `@discordkit/native` returns, so `using` cleans them up at scope exit, or call the returned function yourself.

For an event that doesn't have a typed module yet, `connection.onDispatch` delivers all of them by wire name:

```ts
using sub = connection.onDispatch((event) => {
  if (event.type === `TYPING_START`) {
    // …
  }
});
```

### Letting your handlers declare your intents

Each subscriber carries the intents Discord requires for that event, so the connection can request exactly what the bot uses — no more, no less:

```ts
import {
  connect,
  intentsFor,
  onMessageCreate,
  onGuildCreate
} from "@discordkit/gateway";

connect({
  token,
  intents: intentsFor(onMessageCreate, onGuildCreate)
  // => ["GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILDS"]
});
```

This matters in both directions: under-requesting fails **silently** (the events simply never arrive), and over-requesting a privileged intent you haven't been granted is a fatal `4014`.

### Intents

Intents are bitwise flags declaring which events you want. Requesting none of an intent's events means receiving none of them.

```ts
import {
  intents,
  GatewayIntents,
  PRIVILEGED_INTENTS
} from "@discordkit/gateway";

intents(`GUILDS`, `GUILD_MESSAGES`); // 513
```

Three intents are **privileged** and must be enabled in the Developer Portal (and approved after verification for apps in 100+ guilds): `GUILD_PRESENCES`, `GUILD_MEMBERS`, and `MESSAGE_CONTENT`.

> [!WARNING]
>
> `MESSAGE_CONTENT` gates message **fields**, not whole events. Without it you still receive `MESSAGE_CREATE` — but `content`, `embeds`, `attachments`, `components`, and `poll` arrive **empty**. This fails silently at runtime rather than erroring, so if messages look blank, check the intent first.

Requesting a privileged intent you haven't been granted closes the connection with `4014`, which is fatal — the client stops rather than reconnecting, because retrying would fail identically forever and burn the daily session start limit.

## Scheduling: two timescales, two mechanisms

This is the distinction most likely to bite you at scale, so it's worth being explicit about.

**Connection-lifecycle timing is in-process, and has to be.** The heartbeat (~41s), its ACK timeout, the identify jitter, and reconnect backoff all run on timers inside the process holding the socket. That isn't a shortcut — it's forced:

- **Cron's floor is one minute.** Inngest, Trigger.dev, and Vercel Cron are all cron-expression based; none schedule sub-minute. A 41-second heartbeat is simply not expressible.
- **Durable execution engines can't hold a socket.** Temporal, Inngest, Trigger.dev, and Vercel Workflow all work by deterministic replay of _steps_. A live connection cannot survive being replayed or suspended, which is why none of them document doing it.
- **The "heartbeat pattern" you'll read about is a different thing.** Cron waking a process to do work and sleep again assumes the process is _stateless between wakes_. Here the socket **is** the state.

**Application scheduling belongs on your platform, not in this library.** Session cleanup, leaderboard rollups, scheduled posts, digest jobs, supervision after an outage — anything on the minutes-to-months timescale — should run on cron or a durable-execution platform. This package deliberately ships no helpers for it: a `setTimeout` per quiz session or per pending cleanup is exactly the in-memory bloat that bites once you have more than a handful, and it dies with the process.

| Timescale                            | Examples                                          | Mechanism                                          |
| ------------------------------------ | ------------------------------------------------- | -------------------------------------------------- |
| Sub-minute, connection lifecycle     | heartbeat, ACK timeout, jitter, reconnect backoff | in-process timers (this package)                   |
| Minutes to months, application logic | cleanup, rollups, scheduled posts, retries        | cron / Inngest / Trigger.dev / Temporal / Workflow |

### Customising connection timers

The `Scheduler` seam exists for hosts that can schedule **more durably** than an in-memory timer — not to move heartbeats off-process, which isn't possible.

```ts
export interface Scheduler {
  setTimeout: (callback: () => void, ms: number) => unknown;
  clearTimeout: (handle: unknown) => void;
}
```

The default uses the platform's global timers, which [WinterTC's Minimum Common API](https://wintertc.org/) guarantees on every runtime that can host a Gateway connection. **Most consumers never touch this.**

The motivating override is a Cloudflare Durable Object: a DO loses its JS timers on eviction, so a `setTimeout`-driven heartbeat silently stops and the session dies. A DO alarm survives eviction and wakes the object back up. [`examples/with-cloudflare`](../../examples/with-cloudflare) implements that in ~40 lines — including the bit that isn't obvious, multiplexing several pending timers onto a DO's single, non-repeating alarm slot.

It's also what makes timing testable: a fake scheduler drives heartbeat and backoff behaviour without waiting in real time.

## Where a Gateway connection can actually live

Not every "serverless" host can hold one, and the differences are sharper than they look:

| Host                                                             | Connection lifetime                            | Verdict                                                  |
| ---------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| Cloudflare Durable Objects, celld, a container (Railway/Fly/VPS) | unbounded                                      | ✅ the real targets                                      |
| Vercel Fluid Services                                            | bounded by `maxDuration` — 800s, 1800s in beta | ⚠️ works, but cycles every 13–30 min                     |
| Vercel Functions, Inngest, Trigger.dev, Temporal                 | invocation-scoped or replay-based              | ❌ can't hold a socket — ideal for the work _around_ one |

The middle row is the trap. Vercel Fluid genuinely keeps WebSockets open, but every connection is capped by `maxDuration`, so a Gateway session gets cycled every 13–30 minutes forever. Each cycle likely means a fresh `IDENTIFY` rather than a `RESUME`, and Discord allows **1000 session starts per day** — that's your whole budget spent on merely staying connected, before any real reconnect, deploy, or Discord-side outage. Events drop in each gap too.

## Connection lifecycle

The client implements the full documented lifecycle:

- **Identify / Resume** — resumes with the session id and sequence number when a socket drops recoverably, which replays missed events instead of losing them.
- **Heartbeat** — first beat delayed by `heartbeat_interval * random()` (Discord asks for this jitter so bots don't stampede after a deploy), and a missing `HEARTBEAT_ACK` is treated as a zombied connection.
- **Reconnect** — exponential backoff from 1s to 30s, and **no** reconnect after a fatal close (`4004` bad token, `4010` invalid shard, `4013`/`4014` intents).

## Related packages

- [`@discordkit/client`](../client) — the REST API, including `getGateway` and `getGatewayBot` for the WSS URL, recommended shard count, and session start limits.
- [`@discordkit/core`](../core) — the shared request/validation layer.
- [`@discordkit/native`](../native) — the Discord Social SDK for desktop apps.

## License

MIT
