---
"@discordkit/gateway": major
---

Subscribing now registers the intents that event needs, so most bots never name one.

```diff
 onMessageCreate(handler);
-gateway.setIntents(onMessageCreate).connect();
+gateway.connect();
```

Every subscriber already carries its own intents, and every subscription already names its connection, so the connection can derive the exact mask from the handlers a bot actually uses. A hand-written list was the one part that could drift: under-request and the events never arrive, silently.

`setIntents()` is now **additive** rather than replacing. It is for intents no handler implies — above all `MESSAGE_CONTENT`, which gates message _fields_ rather than an event:

```ts
onMessageCreate(handler);
gateway.setIntents(`MESSAGE_CONTENT`).connect();
```

Both `setIntents()` and subscribing **throw once connected**. Discord reads intents only in IDENTIFY, so a handler added to a live connection would never receive its event — the failure this package exists to prevent. Close and connect again to apply a new set.

`connect()` throws when nothing has contributed an intent. `ConnectionLike` gains `registerIntents`, which any custom implementation or test stub must provide, and `GatewayConnection` gains an `intents` getter returning the resolved list.
