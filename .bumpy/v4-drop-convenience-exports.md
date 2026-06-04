---
"@discordkit/core": major
"@discordkit/client": major
---

## Drop pre-built `*Safe` / `*Procedure` / `*Query` exports

Each `@discordkit/client` endpoint now exports only two symbols: the input `*Schema` and the raw Fetcher. The runtime-validated `*Safe` Proxy, the tRPC `*Procedure` builder, and the react-query `*Query` wrapper are no longer pre-wired per endpoint.

### Migration

The helpers themselves still ship from `@discordkit/core` — call them yourself where you need them:

```ts
// Before
import {
  getGuildSafe,
  getGuildProcedure,
  getGuildQuery
} from "@discordkit/client";

// After
import { toValidated, toProcedure, toQuery } from "@discordkit/core";
import { getGuild, getGuildSchema } from "@discordkit/client";
import { guildSchema } from "@discordkit/client";

const getGuildSafe = toValidated(getGuild, getGuildSchema, guildSchema);
const getGuildProcedure = toProcedure(
  `query`,
  getGuild,
  getGuildSchema,
  guildSchema
);
const getGuildQuery = toQuery(getGuild);
```

The new pattern keeps the integration logic visible at the consumer site, removes ~600 dead exports from the published surface, and lets you customize the wrapping (different schemas, different procedure types, layered middleware) without forking the library.

### Also removed

- The `procedures.ts` barrel files (per-subdir and root) and their `allProcedures` / `<group>Procedures` namespace re-exports.

### See also

- `README.md` for the updated integration examples.
- `examples/with-nextjs/src/app/api/trpc/[trpc]/trpc.ts` for a working tRPC router built on the new pattern.
