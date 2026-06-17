---
"@discordkit/core": patch
---

Dropped the `type-fest` dependency. `toCamelKeys`/`toSnakeKeys` now use local `CamelKeys`/`SnakeKeys` types instead of type-fest's `CamelCasedPropertiesDeep`/`SnakeCasedPropertiesDeep` — behaviorally identical for the underscore-delimited Discord API keys these convert, with one fewer runtime dependency.
