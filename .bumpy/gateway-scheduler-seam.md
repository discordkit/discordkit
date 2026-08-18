---
"@discordkit/gateway": minor
---

Add a `Scheduler` seam so hosts with durable scheduling can drive the connection's lifecycle timers. Defaults to the platform's global timers, so nothing changes for existing consumers.

The heartbeat is now a self-rescheduling one-shot timeout rather than `setInterval`, which avoids overlapping runs and is the only shape a Durable Object alarm can express. The README documents which scheduling concerns belong in-process and which belong on cron or a durable-execution platform.
