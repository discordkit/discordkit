---
"@discordkit/gateway": major
---

`createConnection()` is now `new GatewayConnection()`, and a connection is disposable.

```diff
-const connection = createConnection({ token, intents: [`GUILDS`] });
+const connection = new GatewayConnection({ token, intents: [`GUILDS`] });
```

Scoping a connection to a block now cleans it up automatically, even if the block throws — the socket closes, timers clear, and no reconnect is scheduled:

```ts
using connection = new GatewayConnection({ token, intents: [`GUILDS`] });
connection.connect();
```

`[Symbol.dispose]()` is an alias for `close()` rather than a second teardown path: leaving a scope means you are done with the connection, which is exactly what `close()` already meant.

The connection's session state (session id, sequence number, heartbeat-ack status, reconnect attempts) is now genuinely private in `#` fields. It was previously closure state reachable through the returned object's getters.

Two decisions the connection makes are now pure functions, exported and independently testable rather than reachable only by driving a live socket through each case:

- `backoffDelay(attempts)` — the exponential reconnect curve and its cap.
- `closeAction(code)` — whether a close code means resume, reconnect fresh, or stop. This is the highest-consequence branch in the client: getting it wrong either burns the 1000/day session-start limit in a reconnect loop, or silently stops a bot forever.

A new `ConnectionLike` interface describes the connection surface structurally, for code that accepts a connection without owning one — the event fan-out takes it, and tests substitute fakes. It deliberately does not extend `Disposable`, so a stub needs no no-op `[Symbol.dispose]`.
