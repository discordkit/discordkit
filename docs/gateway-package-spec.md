# Spec — `@discordkit/gateway`, a tree-shakeable Discord Gateway client

> Status: **Implemented** · Owner: Drake Costa · Spec dated 2026-08-14
>
> Kept as the design record for `@discordkit/gateway`. Where the shipped code
> differs, the code is authoritative — notably `GatewayConnection` is a
> disposable class rather than the `createConnection` factory this spec
> describes.
> Scope of v0: **connection lifecycle + typed event subscription**, targeting the
> **Cloudflare Workers / Durable Object** runtime contract.

## 1. Goal

Give discordkit a **Gateway (WebSocket) vertical** to sit alongside the REST
(`@discordkit/client`) and native Social SDK (`@discordkit/native`) surfaces. The Gateway
is the only way to receive real-time events — `MESSAGE_CREATE`, `INTERACTION_CREATE`,
`GUILD_CREATE` — which HTTP Interactions structurally cannot deliver.

The package must hold the line on discordkit's core tenet: **you only import what you
need**. Every other JavaScript Discord library ships a weighty object-oriented monolith
where `new Client()` drags in the entire event surface. We export **one const per event**,
so importing `onMessageCreate` never pulls in `onGuildRoleDelete`.

Non-goals for v0: sharding beyond a single connection, ETF encoding, transport compression,
voice gateway, `REQUEST_GUILD_MEMBERS` pagination helpers. The architecture must not
_preclude_ these, but we build them incrementally after the core is proven (CLAUDE.md Rule 2).

## 2. Key findings that shaped this design

Established first-hand from the cached docs (`.discord-docs/`, gitignored) and by running
the code. **These are the load-bearing facts; if any turns out wrong, the plan changes.**

1. **The Gateway spec spans four doc pages, not one** — and the most important tables are
   _not_ on the Gateway page:

   | Page                                 | Size   | Contains                                               |
   | ------------------------------------ | ------ | ------------------------------------------------------ |
   | `events/gateway.md`                  | 53 KB  | Lifecycle, intents, sharding, compression, rate limits |
   | `events/gateway-events.md`           | 136 KB | 7 send events + **84 receive events**                  |
   | `topics/opcodes-and-status-codes.md` | 76 KB  | **Gateway Opcodes (13), Close Event Codes (14)**       |
   | `events/webhook-events.md`           | 33 KB  | HTTP webhook events — _not_ Gateway, out of scope      |

   All four are **already cached**: `scripts/docs/fetch.ts` already lists `/developers/events/`
   in `INCLUDE_PREFIXES` and already appends `.md` for the Mintlify markdown render.
   → **No fetcher work is required.**

2. **Authoritative counts come from the docs, not from summarization.** A generic LLM
   summary of the Gateway page reported "8 opcodes / ~6 close codes". Running
   `parse.ts topics/opcodes-and-status-codes.md` reports **13 opcodes and 14 close codes**.
   → **Codegen must be driven off the cached markdown**, never off a model's prose summary.

3. **`parse.ts` is endpoint-and-object shaped; the Gateway is protocol shaped.** It handles
   `<Route>` components and Structure tables, which is why it extracts the opcodes page
   cleanly and finds both REST endpoints. It has three gaps on Gateway content:
   - `events/gateway.md` yields **8 unparsed sections** (Connections, Gateway Intents, Rate
     Limiting, Encoding and Compression, Tracking State, Guild Availability, Sharding). These
     are **prose**, and belong in hand-written JSDoc — not codegen. _Not a defect._
   - The **intent → event map is a fenced code block**, not a table:
     ```
     GUILDS (1 << 0)
       - GUILD_CREATE
       - GUILD_UPDATE
       …
     ```
     Privileged-gated events carry a trailing `*`. The table-oriented parser correctly skips
     it. A ~15-line dedicated parser yields the authoritative map.
   - `events/gateway-events.md` collapses ~84 discrete events into **15 bogus "objects"**
     named after section headings (`Messages (4 fields)`, `Guilds (12 fields)`). The parser
     has no concept of "a `####` under `## Receive Events` is an event."

   → **Extend the pipeline with a Gateway-specific parser. Do not rewrite `parse.ts`.**

4. **Gateway payloads are documented as _client schemas plus deltas_.** `MESSAGE_CREATE` reads
   verbatim: _"The inner payload is a [message](…) object with the following extra fields"_ —
   `guild_id?`, `member?`, `mentions`, `channel_type?`.
   → **Reusing `@discordkit/client`'s valibot schemas is what the spec literally describes**,
   not merely a convenience. `client` becomes a real dependency (it is `sideEffects: false`
   with per-subpath exports, so it tree-shakes cleanly).

5. **The Gateway surface in discordkit today is exactly zero.** No `getGateway`/`getGatewayBot`
   fetcher, no intent bitfield, no opcode enum anywhere in `packages/client/src`.
   ⚠️ **Naming trap:** `packages/client/src/event/` is **Guild Scheduled Events** (REST), and is
   unrelated to Gateway events. The new package must not overload that word carelessly.

6. **MSW 2.15 intercepts WebSockets, verified by running it.** `msw` is already a root
   dependency (`.yarnrc.yml` catalog `^2.15.0`) and is used by `test-utils` and `e2e`:

   ```
   ws.link keys: clients,addEventListener,broadcast,broadcastExcept
   node global WebSocket: function
   patched:   true     ← WebSocketInterceptor.apply()  replaces globalThis.WebSocket
   restored:  true     ← .dispose()                    restores it exactly
   ```

   Connections stay **closed by default** (no accidental traffic to `gateway.discord.gg`),
   `server.connect()` is opt-in, and `event.preventDefault()` allows asserting on
   client→server frames — i.e. heartbeat cadence and resume payloads are directly testable.
   → **No hand-rolled mock seam is needed.** `connection.ts` calls plain `new WebSocket(url)`;
   the production code path is the path under test. Clean restore means no cross-file global leak.

7. **`signal-polyfill` is not warranted here** (user direction, and it holds up structurally).
   `@discordkit/native` uses it because desktop UIs observe presence state reactively. This
   package is **backend-only**: a Durable Object is single-threaded and event-loop driven, so
   the microtask-deferred `Signal.subtle.Watcher` machinery buys nothing over a plain
   `Set<handler>` — it is pure weight on the hot path. A hypothetical client consumer can use
   TanStack Query's subscription support.
   → **Use a plain callback registry.** Keep `native`'s `Subscription` _shape_ (see §4.2).

8. **celld is an unverified escape hatch, not a supported target.** It executes Wrangler
   bundles self-hosted, but the repo is **~4 commits old**, ships explicit security warnings,
   documents **no DO alarm support**, and mentions WebSockets only in passing re: memory
   pressure. Since alarms are the natural mechanism for heartbeat scheduling, celld cannot be
   claimed as a validated fallback.
   → **Target the Cloudflare DO contract because it is a good portable contract.** Record celld
   as insurance to re-verify if self-hosting is ever needed. Do not design _for_ it.

9. **Connection-lifecycle timing cannot be externalised — but application scheduling must be.**
   Surveyed after the package landed, prompted by a concern that documenting only in-process
   timers would lead users into scaling problems. The concern is right; the remedy isn't where
   it first appears:
   - **Cron cannot drive a heartbeat.** Discord's interval is **~41s**; cron's floor is
     **one minute** (Inngest, Trigger.dev, Vercel Cron are all cron-expression based —
     Inngest's only sub-minute concept is _jitter_, 1s–5min, which spreads rather than
     schedules).
   - **Durable-execution engines cannot hold a socket.** Temporal, Inngest, Trigger.dev and
     Vercel Workflow all replay _steps_ deterministically; a live connection can't survive
     replay or suspension. Temporal's own guidance that long histories "may bog down" and need
     `Continue-As-New` is that same constraint. Notably **Cloudflare Workflows is itself built
     on DOs**, so alarms sit _under_ the durable-execution layer rather than beside it.
   - **The named "heartbeat pattern"** (cron wakes a process, it works, it sleeps) assumes the
     process is _stateless between wakes_. Here the socket **is** the state.
     → Keep lifecycle timers in-process behind a `Scheduler` seam (justified by DO-eviction
     resilience and testability, **not** external scheduling). Ship **no** application-level
     scheduling helpers, and document the split — a `setTimeout` per session is exactly the
     in-memory bloat that bites at scale.

10. **`crossws` — the ecosystem's cross-runtime WebSocket layer — does not cover us.** Nitro/UnJS
    ships it with Node/Bun/Deno/Workers adapters, and Elysia's Node adapter delegates to it
    entirely. But it abstracts **inbound servers only**; our Gateway socket is an **outbound
    client**. There is no established abstraction to conform to. Hono's model is the useful
    precedent instead: nine first-class targets, each with an adapter, and it abstracts the
    **entry point — not scheduling**. No surveyed framework abstracts timers, because WinterTC
    already guarantees them everywhere.

11. **Not every "serverless" host can hold a Gateway connection, and the middle tier is a trap.**

    | Host                                             | Connection lifetime                            | Verdict                   |
    | ------------------------------------------------ | ---------------------------------------------- | ------------------------- |
    | Cloudflare DO, celld, a container                | unbounded                                      | ✅ real targets           |
    | Vercel Fluid Services                            | capped by `maxDuration` — **800s**, 1800s beta | ⚠️ cycles every 13–30 min |
    | Vercel Functions, Inngest, Trigger.dev, Temporal | invocation-scoped / replay                     | ❌ cannot hold a socket   |

    Vercel Fluid **does** keep WebSockets open (a real change from invocation-scoped Functions),
    but the cap forces a reconnect every 13–30 minutes forever. Each cycle is likely a fresh
    `IDENTIFY` rather than a `RESUME`, against a budget of **1000 session starts/day** — the
    whole budget spent on staying connected, with dropped events in each gap. Vercel's guidance
    also says to keep state out of memory (offload to Redis), the inverse of the DO model.
    ⚠️ Assessed from documentation, **not** a running spike; outbound-specific persistence is
    undocumented either way.

## 3. Architecture (the central decision)

**Consumption mirrors `@discordkit/native`. Schemas and JSDoc mirror `@discordkit/client`.**

The reason is structural, not stylistic. A `Fetcher` is **stateless** — `getCurrentUser()`
builds a URL and returns a promise; `DiscordSession` is a singleton only to centralize a token
and rate-limit buckets. A Gateway connection is the opposite: **irreducibly stateful and
singular**. It owns a live socket, a heartbeat interval, a monotonic sequence number `s`, a
`session_id`, and a `resume_gateway_url`; Discord permits exactly **one session per bot/shard**.
That is a protocol constraint, not a convenience.

`native` already models precisely this. Its `clientEventFanout` owns **one** client-wide native
callback per event, registered lazily on first subscribe, fanned out to a `Set` of JS
subscribers — structurally identical to **one WebSocket fanned out to many event handlers**.

```
   Discord Gateway (single WSS connection)
              │
              ▼
      GatewayConnection            ← owns socket, heartbeat, seq, session_id, resume URL
              │
       dispatch fan-out            ← routes on payload `t`
              │
   ┌──────────┼──────────┬─────────────┐
   ▼          ▼          ▼             ▼
onReady  onMessageCreate  onInteractionCreate  …   ← one exported const per event
```

### 3.1 Package layout

```
packages/gateway/src/
  index.ts
  ambient.ts            # useConnection() — ambient default + explicit override
  connection.ts         # WS lifecycle: identify, heartbeat+jitter, resume, backoff
  subscription.ts       # Subscription shape, copied from native (no signals)
  eventFanout.ts        # dispatch fan-out keyed on payload `t`
  types/
    GatewayOpcode.ts        # 13 rows — codegen'd
    GatewayCloseCode.ts     # 14 rows + isResumable() predicate — codegen'd
    GatewayIntents.ts       # bitfield(), mirroring client's ApplicationFlags
    GatewayPayload.ts       # { op, d, s, t }
    Identify.ts / Resume.ts / Hello.ts / Ready.ts
  events/                   # one file per event, one export each
    onMessageCreate.ts      # messageSchema + documented extra fields
    onInteractionCreate.ts
    …
```

### 3.2 Ambient singleton + explicit override

Mirrors `native` exactly (user decision). Every subscription accepts an optional
`{ connection }` to target a specific instance; omitted, it resolves the ambient default:

```ts
// Simple bot script — ambient.
using sub = onMessageCreate((msg) => { … });

// Durable Object — explicit, no module-global state across isolates.
const connection = new GatewayConnection({ token, intents });
using sub = onMessageCreate((msg) => { … }, { connection });
```

This is the only shape that serves both a one-file bot and a DO holding its own instance.

### 3.3 Compile-time intent enforcement

`Fetcher<S, R, C>` already proves this codebase encodes endpoint capabilities in the type
system: `C extends { anonymous: true }` flips `options` from optional to **required**. We
mirror that for intents. Each event carries a phantom marker for the intents it requires, so
subscribing without declaring them is a **type error**.

This directly prevents the Gateway's nastiest failure mode: without the privileged
`MESSAGE_CONTENT` intent (`1 << 15`), Discord still delivers `MESSAGE_CREATE` — but with
`content` **silently empty**. That is a runtime-only, data-dependent failure that a
conjugation-quiz bot would hit in production, not in tests. The intent→event map from §2.3
supplies the data to generate these markers, including the `*`-flagged privileged gating.

## 4. Reuse from existing packages

### 4.1 From `@discordkit/client`

- **Valibot schemas** for every dispatch payload (`messageSchema`, `interactionSchema`, …),
  extended with the documented per-event extra fields (§2.4).
- **Authoring conventions**: one export per file; `### [Name](docs-url)` JSDoc headers;
  `enum` + `v.enum_()` for enumerations; `bitfield()` for flag sets.
- **Two new REST fetchers land in `client`, not here** (user decision): `GET /gateway` and
  `GET /gateway/bot` (returning `url`, `shards`, `session_start_limit`). They are ordinary
  REST endpoints, they already parse cleanly out of the pipeline, and they are useful to
  non-Gateway consumers. `gateway` depends on `client` to bootstrap its URL.

### 4.2 From `@discordkit/native`

- **The `Subscription` shape, verbatim**: `type Subscription = (() => void) & Disposable`,
  built by a `toSubscription(teardown)` helper that is idempotent and `using`-compatible. One
  identical unsubscribe shape across every discordkit event API.
- **The fan-out pattern** from `clientEventFanout`: one upstream registration per event,
  lazily created, fanned out to a subscriber `Set`, with a per-call options bag carrying the
  instance override.
- **The koffi-free module split discipline**: `native` deliberately keeps `subscription.ts`
  separate from `client.ts` so browser bundles never drag in a native addon. The equivalent
  here is keeping any Node-only code off the hot path, so the Workers/DO bundle stays clean.

## 5. Testing strategy

Per CLAUDE.md Rule 9, every test must encode **why** behavior matters and must be proven to
fail for the right reason (inject the bug, confirm the catch, restore).

- **Unit / protocol tests — MSW `ws.link()`** against a synthetic Gateway. Because connections
  are closed by default, each test scripts the exact server side it needs:
  `HELLO` → assert `IDENTIFY` (correct intents bitfield!) → `READY` → dispatch → assert handler.
  Directly testable properties: heartbeat cadence and jitter, `s` tracking, `RESUME` after a
  resumable close, **no** resume after `4013`/`4014`, backoff on `INVALID_SESSION`.
- **No live Discord connection in CI.** Same posture as `native`, which unit-tests against a
  mock FFI backend rather than a real binary.
- **E2E** is deferred. celld is not validated (§2.8); a real-Discord smoke would need a bot
  token and a guild, so it belongs behind the same gating as `native.yml`'s ABI smoke.

## 6. Delivery plan

Each step is independently reviewable and lands with its own bump file.

1. **`client`**: `getGateway`, `getGatewayBot`, `SessionStartLimit`. Unblocks bootstrap; already
   parses cleanly today.
2. **`scripts/docs`**: Gateway parser extension — intent code-block parser, `####`-under-
   `## Receive Events` event extractor. Codegen opcodes (13), close codes (14), intents.
3. **`packages/gateway` scaffold**: connection lifecycle, fan-out, `Subscription`, MSW-backed
   protocol tests. **No events yet** — prove the protocol first.
4. **Events, in batches**: lifecycle-critical first (`READY`, `RESUMED`, `GUILD_CREATE`,
   `MESSAGE_CREATE`, `INTERACTION_CREATE`), then the long tail.

### 6.1 Open question flagged for step 4

84 receive events is a large surface, and roughly 60 are thin aliases over existing client
schemas. Codegen for all 84 is cheap and consistent; **hand-auditing all 84 is not**. Shipping
generated-but-unreviewed schemas risks plausible-looking-but-wrong types, and a test that
cannot fail is worse than no test (Rule 9). Recommendation: **codegen all 84, hand-audit and
hand-test the lifecycle-critical set first**, then work the tail in reviewed batches.

## 7. Consequences and risks

- **`client` becomes a runtime dependency of `gateway`.** Justified by §2.4, and safe because
  `client` is `sideEffects: false` with subpath exports. Must be verified by a bundle-size check
  that importing one event does not pull the whole schema surface.
- **Web-standard `WebSocket` only.** Node 22+ provides it globally, so the hot path stays clean
  and no `ws` dependency is introduced. This is what keeps the Workers/DO target honest.
- **Intent phantom types add real type complexity.** This is the one place we deliberately spend
  complexity budget (Rule 2), because the failure it prevents is silent and data-dependent.
- **Sharding is deferred but not precluded.** The ambient-plus-override design means a second
  connection is already expressible; `getGatewayBot`'s `shards` value is fetched from day one.
