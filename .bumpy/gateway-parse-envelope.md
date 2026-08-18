---
"@discordkit/gateway": minor
---

Inbound frames are now parsed against `gatewayPayloadSchema` instead of asserted, and fatal protocol errors are observable.

`#handleMessage` cast `JSON.parse` straight to `GatewayPayload`. Nothing checked it, so an unexpected `op` fell through the switch unnoticed and a non-numeric `s` would have corrupted the sequence number used to RESUME. `d` stays `unknown`, so this validates the envelope without paying to validate every event's body.

Doing so surfaced a bug in the schema itself: `d` was required, but Discord documents it as `?mixed` and sends `RECONNECT` with no `d` at all. Parsing would have rejected Discord's own request to reconnect. `d` is now optional and covered by tests.

New `onError` subscription for fatal protocol errors:

```ts
gateway.onError((error) => {
  console.error(error.message);
});
```

A binary frame now reports through it and closes without reconnecting, rather than throwing from inside the socket's message listener where no consumer could catch it. Retrying would meet the identical condition and spend the daily session-start budget to fail the same way. With no subscriber the error still reaches the console, since an unobserved fatal is the silent failure this package exists to surface.

`ConnectionLike` gains `onError`, which custom implementations and test stubs must provide.
