---
"@discordkit/gateway": minor
---

Complete the dispatch event surface: all 79 dispatchable events are now typed and tested, with a coverage guard that fails the build if a docs refresh adds one nobody wired up.

The final batch adds channels and threads (pins, list sync, members update, channel info, voice channel status/start time), invites, voice effects and server updates, stage instances, entitlements, subscriptions, webhooks, auto-moderation execution, integration delete, and the gateway rate-limit event.
