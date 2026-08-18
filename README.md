<div align="center">

![Discordkit][logo-light]
![Discordkit][logo-dark]

[![npm version][npm_badge]][npm]
[![CI status][ci_badge]][ci]

A TypeScript SDK for Discord, with support for the [REST API][discord_api] and the native [Social SDK][social-sdk].

</div>

---

## What is Discordkit?

Discordkit is a monorepo of small, focused, tree-shakeable packages. Use them to build Discord apps and integrations in TypeScript. It covers three surfaces:

- **The REST/HTTP API.** A fully-typed Fetcher and a [`valibot`][valibot] schema for every Discord endpoint. Composition helpers add runtime validation, [react-query][react_query], and [tRPC][trpc]. The OAuth2 utilities assume no framework.
- **The Gateway.** A WebSocket client for real-time events, where each dispatch event is its own import. It runs on Cloudflare Workers, Durable Objects, and Node.
- **The native Social SDK.** A functional bridge to Discord's [Social SDK][social-sdk] for desktop runtimes: rich presence, OAuth, relationships, lobbies, messaging, and voice. Adapters run it in an Electron main process or a Tauri sidecar, then expose it to the UI over a typed bridge.

Every package ships ESM, generated `.d.ts` types, and `sideEffects: false`. You pay only for what you import.

> [!NOTE]
> Discordkit recently published its first stable releases. The REST surface is complete. The Gateway, the native Social SDK packages, and the examples below are still changing. Expect rough edges, and read each package's own README for current usage.

## What it ships

Usage documentation lives in each package's README. This table is the map.

### REST / HTTP API

| Package                                   | What it does                                                                                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@discordkit/client`](./packages/client) | A Fetcher + `valibot` schema for every Discord REST endpoint. The main entry point for the HTTP API.                                                                                  |
| [`@discordkit/core`](./packages/core)     | The runtime that powers `client`: session/token management, the request layer, validation primitives, and the composition helpers `toValidated`, `toQuery`, and `toProcedure` (tRPC). |
| [`@discordkit/oauth`](./packages/oauth)   | Framework-agnostic Discord OAuth2 utilities (PKCE authorize, token exchange/refresh) with no framework or storage assumptions.                                                        |

### Realtime / Gateway

| Package                                     | What it does                                                                                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@discordkit/gateway`](./packages/gateway) | A tree-shakeable Gateway (WebSocket) client for Cloudflare Workers, Durable Objects, and Node. Every dispatch event is its own import, with typed intents. |

### Native / Social SDK

| Package                                       | What it does                                                                                                                                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@discordkit/native`](./packages/native)     | Functional TypeScript bridge to the Discord [Social SDK][social-sdk] for Electron, Tauri, and headless Node — rich presence, auth, users, relationships, lobbies, messaging, and voice. |
| [`@discordkit/electron`](./packages/electron) | Electron adapter for `native` — run the Social SDK in the main process and reach it from the renderer over a typed IPC bridge.                                                          |
| [`@discordkit/tauri`](./packages/tauri)       | Tauri adapter for `native` — run the Social SDK in a Node sidecar and reach it from the webview over a typed [kkrpc][kkrpc] bridge.                                                     |

> The Social SDK shared library can't be redistributed, so you supply it yourself. See [`@discordkit/native`](./packages/native#-installation) for how to point the packages at it and which SDK versions are supported.

## Examples

Runnable apps in [`examples/`](./examples), each wiring one or more packages into a real framework.

| Example                                                         | Highlights                                                                                                           |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [`with-cloudflare`](./examples/with-cloudflare)                 | Gateway Event Inspector — DevTools for the Gateway, on a Worker + Durable Object (`gateway`).                        |
| [`with-electron`](./examples/with-electron)                     | Rich Presence live editor (Social SDK via `native` + `electron`), modelled on Discord's Developer Portal visualizer. |
| [`with-tauri`](./examples/with-tauri)                           | A live, tunable unified friends list built on your real Discord relationships (Social SDK via `native` + `tauri`).   |
| [`with-nextjs`](./examples/with-nextjs)                         | Discord OAuth2 login + authenticated API calls in Next.js (App Router).                                              |
| [`with-nextjs-better-auth`](./examples/with-nextjs-better-auth) | The same, but with [Better Auth][better-auth] owning the OAuth2 flow.                                                |
| [`with-astro`](./examples/with-astro)                           | OAuth2 login + authenticated calls in Astro (SSR).                                                                   |
| [`with-tanstack-start`](./examples/with-tanstack-start)         | OAuth2 login + authenticated calls in TanStack Start.                                                                |
| [`with-waku`](./examples/with-waku)                             | OAuth2 login + authenticated calls in [Waku][waku].                                                                  |

## Repository layout

```
packages/    published packages (client, core, oauth, native, electron, tauri)
examples/    runnable example apps, one per framework/runtime
docs/        design notes and architecture specs
static/      logo + brand assets
```

## Working locally

Discordkit uses [Vite+][viteplus] as its toolchain. The global `vp` CLI drives Oxlint, Oxfmt, tsdown, and Vitest. [Bumpy][bumpy] handles versioning and release.

```bash
vp install           # install dependencies (run after every pull)
vp check --fix       # format + lint + typecheck, with autofixes
vp test              # run the Vitest suites
```

To run an example, install at the root, then start it from its directory. Each example's README lists its own dev command and the `.env` values it needs:

```bash
vp install
cd examples/with-nextjs
vp dev
```

The native Social SDK packages are unit-tested against a mock FFI backend, so `vp test` needs no SDK binary. A separate CI job loads the real SDK to verify the ABI. That job needs the non-redistributable binary, so it is maintainer-only and never gates contributions.

## Contributing

1. Branch off `main` and make your change.
2. Run `vp check --fix` and `vp test` until green.
3. Add a bump file describing what changed: `yarn bumpy add` (or the `/bumpy-add-change` skill). This drives the version bump and changelog for your PR.
4. Open a pull request.

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
[social-sdk]: https://discord.com/developers/docs/discord-social-sdk/overview
[valibot]: https://valibot.dev/
[react_query]: https://tanstack.com/query/latest
[trpc]: https://trpc.io/
[better-auth]: https://better-auth.com
[waku]: https://waku.gg
[kkrpc]: https://github.com/kunkunsh/kkrpc
[viteplus]: https://viteplus.dev/
[bumpy]: https://bumpy.varlock.dev/
[license]: ./LICENSE.md
[personal-website]: https://saeris.gg
