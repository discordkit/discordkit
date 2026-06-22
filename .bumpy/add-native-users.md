---
"@discordkit/native": minor
---

Added the `@discordkit/native/users` subpath: `getCurrentUser()` and `getUser(id)` read Discord users from the SDK's cache into plain `User` snapshots (id, username, display/global name, avatar, status, provisional). Establishes the read-handle→snapshot convention (`readUser`) that other read-only domains reuse.
