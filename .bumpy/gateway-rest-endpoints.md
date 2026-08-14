---
"@discordkit/client": minor
---

Add the two Gateway REST endpoints, `getGateway` (**GET** `/gateway`) and `getGatewayBot` (**GET** `/gateway/bot`), along with the `SessionStartLimit`, `GatewayResponse`, and `GatewayBotResponse` schemas.

These return the WSS URL used to open a Gateway connection, plus the recommended shard count and session start limits. They are ordinary REST endpoints, so they live here alongside every other Discord endpoint rather than in the forthcoming `@discordkit/gateway` package, and are useful on their own for monitoring session start budgets.
