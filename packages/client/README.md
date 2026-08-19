<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-dark.svg">
  <img alt="Discordkit" src="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-light.svg">
</picture>

[![npm version][npm_badge]][npm] [![jsr version][jsr_badge]][jsr] [![CI status][ci_badge]][ci]

A fully-typed Fetcher and [`valibot`][valibot] schema for every endpoint in Discord's [REST API][discord_api].

</div>

---

## 📦 Installation

```bash
npm install --save @discordkit/client valibot
# or
yarn add @discordkit/client valibot
```

`valibot` is a peer dependency, shared with the rest of discordkit. [`@discordkit/core`][core] installs alongside as a direct dependency.

## 🔧 Usage

Every endpoint exports two symbols: a Fetcher that calls Discord, and the schema describing its input.

```ts
import {
  // Request handler — calls Discord's REST API
  getGuild,
  // Input validation schema
  getGuildSchema
} from "@discordkit/client";
```

Set a token once on the session provider, then call any endpoint:

```ts
import { discord, getGuild } from "@discordkit/client";

discord.setToken(`Bot ${process.env.DISCORD_BOT_TOKEN}`);

const guild = await getGuild({ id: `123456789012345678` });
```

`setToken` is optional. Without it the session reads `DISCORD_BOT_TOKEN` from the environment, so a bot needs no setup beyond `.env`. Runtimes with no `process.env`, such as Cloudflare Workers, must set it from their binding.

### Acting on behalf of a user

`asUser` scopes requests to one user's OAuth2 access token, then restores the previous session when the scope exits:

```ts
import { discord, getCurrentUser } from "@discordkit/client";

using session = discord.asUser(accessToken);
const profile = await session.request(() => getCurrentUser());
```

Pair it with [`@discordkit/oauth`][oauth] to obtain that token.

### With runtime validation

`toValidated` wraps any Fetcher so both its input and its response are checked at runtime. Useful wherever the input came from outside your app:

```ts
import { toValidated } from "@discordkit/core";
import { getGuild, getGuildSchema, guildSchema } from "@discordkit/client";

const getGuildSafe = toValidated(getGuild, getGuildSchema, guildSchema);

// Throws if the input doesn't match getGuildSchema,
// or the response doesn't match guildSchema.
const guild = await getGuildSafe({ id: `123456789012345678` });
```

### With [react-query][react_query]

`toQuery` turns a `GET` endpoint into a queryFn:

```ts
import { useQuery } from "@tanstack/react-query";
import { toQuery } from "@discordkit/core";
import { getGuild } from "@discordkit/client";

const { data } = useQuery({
  queryKey: [`guild`, guildId],
  queryFn: toQuery(getGuild)({ id: guildId })
});
```

### With [tRPC][trpc]

`toProcedure` scaffolds a router procedure that forwards to Discord:

```ts
import { toProcedure } from "@discordkit/core";
import { getGuild, getGuildSchema, guildSchema } from "@discordkit/client";

export const router = t.router({
  guild: toProcedure(
    `query`,
    getGuild,
    getGuildSchema,
    guildSchema
  )(t.procedure)
});
```

Capability-free endpoints only: those requiring `{ anonymous: true }` or accepting `{ reason }` have no natural channel in tRPC.

## 🚚 Tree shaking

Each endpoint is its own module, and the package is marked `sideEffects: false` with `@__NO_SIDE_EFFECTS__` annotations throughout. Importing `getGuild` never pulls in the other several hundred endpoints, so a bundle only pays for what it calls.

Subpath imports reach any type or schema directly:

```ts
import type { Guild } from "@discordkit/client/guild/types/Guild";
```

## 📣 Acknowledgements

Endpoint documentation taken from Discord's [Official API docs][discord_api].

## 🥂 License

[MIT][license] © [Drake Costa][personal-website]

[npm_badge]: https://img.shields.io/npm/v/@discordkit/client.svg?style=flat
[npm]: https://www.npmjs.com/package/@discordkit/client
[jsr_badge]: https://img.shields.io/jsr/v/@discordkit/client
[jsr]: https://jsr.io/@discordkit/client
[ci_badge]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml/badge.svg
[ci]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml
[core]: https://www.npmjs.com/package/@discordkit/core
[oauth]: https://www.npmjs.com/package/@discordkit/oauth
[valibot]: https://valibot.dev
[react_query]: https://tanstack.com/query/latest
[trpc]: https://trpc.io
[discord_api]: https://discord.com/developers/docs
[license]: https://github.com/discordkit/discordkit/blob/main/LICENSE.md
[personal-website]: https://saeris.gg
