<p align="center">

![Discordkit](./static/logo-light.svg#gh-light-mode-only)
![Discordkit](./static/logo-dark.svg#gh-dark-mode-only)

<p align="center"><a href="https://www.npmjs.com/package/@discordkit/client"><img src="https://img.shields.io/npm/v/@discordkit/client.svg?style=flat" alt="npm"></a><a href="https://github.com/discordkit/discordkit/actions/workflows/ci.yml"><img src="https://github.com/discordkit/discordkit/actions/workflows/ci.yml/badge.svg" alt="CI"></a><a href="https://codecov.io/gh/discordkit/discordkit"><img src="https://codecov.io/gh/discordkit/discordkit/branch/master/graph/badge.svg" alt="codecov"/></a></p>
<p align="center">TypeScript SDK for <a href="https://discord.com/developers/docs">Discord's API</a></p>

---

## 📦 Installation

```bash
npm install --save-dev @discordkit/client zod
# or
yarn add -D @discordkit/client zod
```

> [!WARNING]
>
> 🚧 Additional documentation and examples are currently under construction! 🚧
>
> Discordkit only recently published it's first stable version. Priority is being given to stablizing the CI/CD infrastructure for this monorepo while use-cases are explored and examples are built.

## 🔧 Usage

Out of the box Discordkit supports vanilla JavaScript/Typescript, [react-query](https://tanstack.com/query/latest), and [tRPC](https://trpc.io/). For each of Discord's API endpoints, Discordkit exports a basic request handler function, a pre-wired `tRPC` procedure builder, and for `GET` requests, a `react-query` query function. Additionally, each endpoint also exports a `zod` schema object to validate the input for a request handler.

Here is an example of the available exports and their naming patterns:

```ts
import {
  // Input validation schema
  getGuildSchema,
  // Request handler
  getGuild,
  // tRPC procedure builder
  getGuildProcedure,
  // react-query query function
  getGuildQuery
} from "@discordkit/client";
```

In order to make requests, you must first set your access token on the Discord session provider.

```ts
import { discord } from "@discordkit/client";

discord.setToken(`Bearer <access-token>`, true);
```

#### With [react-query](https://tanstack.com/query/latest):

Using the supplied query functions, you can quickly scaffold your query functions with strong guarantees on input and response validation.

```ts
import { useQuery } from "@tanstack/react-query";
import { getUserQuery } from "@discordkit/client";

export const UserProfile = ({ user }) => {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: [user.username],
    queryFn: getUserQuery({ id: user.id })
  });

  // ...
};
```

```ts
import { useMutation } from "@tanstack/react-query";
import { modifyGuild, modifyGuildSchema } from "@discordkit/client";

export const RenameGuild = ({ guild }) => {
  const [name, setName] = useState(guild.name)
  const { isLoading, isError, data, error } = useMutation({
    mutationFn: modifyGuild,
    onMutate: (variables) => {
      // Will throw if invalid input is given
      modifyGuildSchema.parse(variables)
    }
  });

  const onSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({ guild: guild.id, body: { name } })
  }

  return (
    <form onSubmit={onSubmit}>
      {mutation.error && (
        <h5 onClick={() => mutation.reset()}>{mutation.error}</h5>
      )}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <button type="submit">Rename Guild</button>
    </form>
  )
};
```

#### With [tRPC](https://trpc.io/):

```ts
import { initTRPC } from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import {
    discord,
    getCurrentApplicationProcedure,
    getGuildProcedure
} from "@discordkit/client";

const botToken = process.env.DISCORD_BOT_AUTH_TOKEN;

// Configure your client to use a Bot token by default
discord.setToken(botToken, Boolean(botToken));

const t = initTRPC.context<{ user: string | null }>().create();
const baseProcedure = t.procedure;

// Create a reusable procedure to use a User's auth token when available
const authorizedProcedure = baseProcedure.use(({ ctx }) => {
  if (ctx.user) {
    discord.setToken(`Bearer ${ctx.user}`);
  } else {
    discord.setToken(`Bot ${botToken}`);
  }

  return opts.next();
});

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
          req.headers.authorization.split(" ")[1]
        );
        return user;
      }
      return null;
    }

    return {
      user: await getUserTokenFromHeader();
    };
  }
}).listen(1337);
```

## 📣 Acknowledgements

Endpoint documentation taken from Discord's [Official API docs](https://discord.com/developers/docs/).

## 🥂 License

Released under the [MIT license](https://github.com/Saeris/discordkit/blob/master/LICENSE.md).
