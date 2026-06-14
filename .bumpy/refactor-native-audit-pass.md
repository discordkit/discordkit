---
"@discordkit/native": minor
---

Package-wide consistency + quality pass over `@discordkit/native`. **Breaking (pre-1.0):** the core `Status` and `LogSeverity` string enums are now camelCase (`'ready'`, `'warning'`) to match every feature enum in the package — `client.status` and `onLog` severities change accordingly. Also: extracted a shared `clientEventFanout` helper (lobby + message events now declarative, ~280 lines of duplication removed) and a `toSubscription` helper (one definition of the unsubscribe-+-Disposable shape, replacing 6 copies); added consumer `@example`s to the `Call`/`Lobby` wrappers and key ops; and closed test-coverage gaps so every exported operation has a spec (99 tests).
