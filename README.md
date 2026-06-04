<div align="center">

![Discordkit][logo-light]
![Discordkit][logo-dark]

[![npm version][npm_badge]][npm]
[![CI status][ci_badge]][ci]

TypeScript SDK for [Discord's API][discord_api]

</div>

---

## 📦 Installation

```bash
npm install --save-dev @discordkit/client valibot
# or
yarn add -D @discordkit/client valibot
```

> [!WARNING]
>
> 🚧 Additional documentation and examples are currently under construction! 🚧
>
> Discordkit only recently published it's first stable version. Priority is being given to stablizing the CI/CD infrastructure for this monorepo while use-cases are explored and examples are built.

## 🔧 Usage

Discordkit ships a Fetcher (`async (input) => Promise<output>`) and a `valibot` schema for every Discord REST endpoint. Use them directly, or compose them with the helpers in `@discordkit/core` to layer on runtime validation, tRPC procedures, or react-query.

Each endpoint exports two symbols:

```ts
import {
  // Input validation schema
  getGuildSchema,
  // Request handler — calls Discord's REST API
  getGuild
} from "@discordkit/client";
```

In order to make requests, you must first set your access token on the Discord session provider.

```ts
import { discord } from "@discordkit/client";

discord.setToken(`Bearer <access-token>`, true);
```

#### Direct use:

```ts
import { getGuild } from "@discordkit/client";

const guild = await getGuild({ guild: `123456789012345678` });
```

#### With runtime validation:

`@discordkit/core` exports `toValidated`, a Proxy wrapper that validates the input and output of any Fetcher at runtime. It's framework-agnostic — useful any time you want strong guarantees when accepting external input.

```ts
import { toValidated } from "@discordkit/core";
import { getGuild, getGuildSchema } from "@discordkit/client";
import { guildSchema } from "@discordkit/client";

const getGuildSafe = toValidated(getGuild, getGuildSchema, guildSchema);

const guild = await getGuildSafe({ guild: `123456789012345678` });
// throws if input doesn't match getGuildSchema, or the response doesn't match guildSchema
```

#### With [react-query][react_query]:

For `GET` endpoints, use `toQuery` from `@discordkit/core` to produce a queryFn compatible with [`useQuery`][use_query]:

```ts
import { useQuery } from "@tanstack/react-query";
import { toQuery } from "@discordkit/core";
import { getUser } from "@discordkit/client";

const getUserQuery = toQuery(getUser);

export const UserProfile = ({ user }) => {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: [`user`, user.id],
    queryFn: getUserQuery({ id: user.id })
  });

  // ...
};
```

For mutations, pass the Fetcher straight to [`useMutation`][use_mutation] — schemas can validate input in `onMutate`:

```ts
import { useMutation } from "@tanstack/react-query";
import { modifyGuild, modifyGuildSchema } from "@discordkit/client";

export const RenameGuild = ({ guild }) => {
  const [name, setName] = useState(guild.name);
  const mutation = useMutation({
    mutationFn: modifyGuild,
    onMutate: (variables) => {
      // Will throw if invalid input is given
      modifyGuildSchema.parse(variables);
    }
  });

  const onSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ guild: guild.id, body: { name } });
  };

  return (
    <form onSubmit={onSubmit}>
      {mutation.error && (
        <h5 onClick={() => mutation.reset()}>{mutation.error.message}</h5>
      )}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <button type="submit">Rename Guild</button>
    </form>
  );
};
```

#### With [tRPC][trpc]:

Use `toProcedure` from `@discordkit/core` to wrap a Fetcher + schemas into a tRPC procedure builder. You assemble each procedure where you need it — no per-endpoint imports of pre-wired procedures.

```ts
import { initTRPC } from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { toProcedure } from "@discordkit/core";
import {
  discord,
  getCurrentApplication,
  applicationSchema,
  getGuild,
  getGuildSchema,
  guildSchema
} from "@discordkit/client";

const botToken = process.env.DISCORD_BOT_AUTH_TOKEN;

// Configure your client to use a Bot token by default
discord.setToken(botToken, Boolean(botToken));

const t = initTRPC.context<{ user: string | null }>().create();
const baseProcedure = t.procedure;

// Create a reusable procedure to use a User's auth token when available
const authorizedProcedure = baseProcedure.use((opts) => {
  if (opts.ctx.user) {
    discord.setToken(`Bearer ${opts.ctx.user}`);
  } else {
    discord.setToken(`Bot ${botToken}`);
  }

  return opts.next();
});

const getCurrentApplicationProcedure = toProcedure(
  `query`,
  getCurrentApplication,
  null,
  applicationSchema
);

const getGuildProcedure = toProcedure(
  `query`,
  getGuild,
  getGuildSchema,
  guildSchema
);

const router = t.router({
  getCurrentApplication: getCurrentApplicationProcedure(baseProcedure),
  getGuild: getGuildProcedure(authorizedProcedure)
});

createHTTPServer({
  router,
  createContext({ req }) {
    // Extract a user's auth token from the incoming request headers
    async function getUserTokenFromHeader() {
      if (req.headers.authorization) {
        const user = await decodeAndVerifyJwtToken(
          req.headers.authorization.split(` `)[1]
        );
        return user;
      }
      return null;
    }

    return {
      user: await getUserTokenFromHeader()
    };
  }
}).listen(1337);
```

## 🤝 Contributing

The project uses [Vite+][viteplus] as a unified toolchain (Oxlint + Oxfmt + tsdown + Vitest) and [Bumpy][bumpy] for versioning and release.

```bash
vp install           # install dependencies
vp check --fix       # format + lint + typecheck (with autofixes)
vp test              # run Vitest
yarn bumpy add       # create a bump file for your PR
```

## 📣 Acknowledgements

Endpoint documentation taken from Discord's [Official API docs][discord_api].

## 🥂 License

Released under the [MIT license][license] © [Drake Costa][personal-website].

[logo-light]: https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-light.svg#gh-light-mode-only
[logo-dark]: https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-dark.svg#gh-dark-mode-only
[npm_badge]: https://img.shields.io/npm/v/@discordkit/client.svg?style=flat
[npm]: https://www.npmjs.com/package/@discordkit/client
[ci_badge]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml/badge.svg
[ci]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml
[discord_api]: https://discord.com/developers/docs
[react_query]: https://tanstack.com/query/latest
[use_query]: https://tanstack.com/query/latest/docs/react/reference/useQuery
[use_mutation]: https://tanstack.com/query/latest/docs/react/reference/useMutation
[trpc]: https://trpc.io/
[viteplus]: https://viteplus.dev/
[bumpy]: https://bumpy.varlock.dev/
[license]: ./LICENSE.md
[personal-website]: https://saeris.gg
