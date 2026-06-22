---
"@discordkit/native": minor
---

Added the `@discordkit/native/relationships` subpath: read the current user's friends/blocked/pending list (`getRelationships`, `getRelationship` → `Relationship` snapshots embedding the target `User`) and manage relationships (send/accept/reject/cancel friend requests for Discord and game scopes, by id or username; remove friends; block/unblock). Also adds the FFI seam's list primitive (`allocSpanOut`/`readSpan`) used by every list-returning op.
