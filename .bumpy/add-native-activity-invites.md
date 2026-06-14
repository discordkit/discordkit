---
"@discordkit/native": minor
---

Added the `@discordkit/native/activity-invites` subpath: the join/spectate half of rich presence. Send invites and join requests (`sendActivityInvite`, `sendActivityJoinRequest`), reply to and accept them (`replyToActivityJoinRequest`, `acceptActivityInvite` → resolves with the join secret), and listen for incoming invites (`onActivityInviteCreated`, `onActivityInviteUpdated`) as plain `ActivityInvite` snapshots. Introduces the package's first persistent SDK event-subscription shape (a long-lived callback returning a `Subscription`, distinct from the one-shot `awaitResult` ops) and the first snapshot↔handle round-trip (`readActivityInvite`/`buildActivityInvite`).
