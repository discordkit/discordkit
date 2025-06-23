---
"@discordkit/client": major
"@discordkit/core": major
---

Migrate schemas from `zod` to `valibot`

This update represents a major refactor of both the core and client library codebases.

Since Valibot has now become stable, Discordkit is migrating away from `zod` in favor of `valibot` as it's schema library because of it's significantly lighter weight when bundling. This choice was made because Discordkit is designed to be used in a variety of environments such as edge functions, serverless runtimes, and directly on clients, all of which are places where every byte saved counts towards better performance. From the beginning, Discordkit was designed to be functional in nature, so that you'll only bundle what you import and consume, which is the shared ethos of Valibot.

Along with this change comes some significant refinements to every schema, so that it closer matches the behavior of Discord's API. Work on updating these schemas to match the v10 API one to one is ongoing, and as such some of the latest field updates may not yet be reflected in Discordkit. These will be patched in incrementally following this release.
