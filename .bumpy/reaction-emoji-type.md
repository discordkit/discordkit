---
"@discordkit/core": minor
"@discordkit/client": minor
---

Reaction endpoints now accept the emoji forms Discord actually takes. `createReaction`, `deleteOwnReaction`, `deleteUserReaction`, `deleteAllReactionsForEmoji` and `getReactions` typed `emoji` as `snowflake`, which is a runtime validator, not just a type. It rejected both a Unicode emoji (`"❌"`) and the `name:id` custom form that these endpoints' own documentation describes, leaving a custom emoji's bare id as the only value that parsed. A cast could satisfy the compiler but not the validator.

Adds `reactionEmoji` to `@discordkit/core/validations`, accepting all three documented forms:

- a Unicode emoji, as the character itself (`"❌"`)
- a custom emoji, as `name:id` (`"catgirl:1234567890123456789"`)
- a custom emoji's bare id

A value containing `/` is rejected, since it would split into a second path segment and address a different endpoint.

Callers do not need to percent-encode the value. `URL` encodes non-ASCII path segments on its own and leaves an existing `%` untouched, so encoded and unencoded input produce identical requests.

This widens what the five endpoints accept and rejects nothing that previously parsed.

Reported by the team building [inbou](https://github.com/discordkit/inbou).
