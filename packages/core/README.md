<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-dark.svg">
  <img alt="Discordkit" src="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-light.svg">
</picture>

[![npm version][npm_badge]][npm] [![jsr version][jsr_badge]][jsr] [![CI status][ci_badge]][ci]

Runtime helpers and shared validation primitives that power [`@discordkit/client`][client].

</div>

---

## 📦 Installation

`@discordkit/core` is installed automatically as a dependency of [`@discordkit/client`][client]. Install it directly when you want the composition helpers without the endpoint surface:

```bash
npm install --save-dev @discordkit/core valibot
# or
yarn add -D @discordkit/core valibot
```

## What's inside

- **Composition helpers** — `toValidated`, `toProcedure`, `toQuery`. Wrap any Fetcher with runtime validation, build tRPC procedures, or produce react-query queryFns. Designed to be called at the consumer site rather than pre-wired per endpoint.
- **Session management** — `DiscordSession` and the default `discord` instance: token storage, base URL configuration, header construction, anonymous-request opt-out.
- **Request layer** — `get` / `post` / `patch` / `put` / `remove` / `multipart` low-level helpers + the `Fetcher<S, R, C>` capability-aware type used by every endpoint in `@discordkit/client`.
- **Validation primitives** — schema typing helpers (`schema<T>`, `partialSchema`, `pickFields`, `omitFields`, `requiredFields`, `variantSchema`), `boundedString`, `boundedInteger`, `snowflake`, `timestamp`, `datauri`, `fileUpload`, etc. Build your own schemas without re-deriving them.
- **`@__NO_SIDE_EFFECTS__` annotations and `sideEffects: false`** — every export is tree-shake-friendly. Consumer bundles only pay for what they actually import.

## 🔧 Usage

See the [`@discordkit/client` README][client] for the full usage walkthrough — every example there relies on `@discordkit/core` for the actual composition.

## 📣 Acknowledgements

Endpoint documentation taken from Discord's [Official API docs][discord_api].

## 🥂 License

[MIT][license] © [Drake Costa][personal-website]

[npm_badge]: https://img.shields.io/npm/v/@discordkit/core.svg?style=flat
[npm]: https://www.npmjs.com/package/@discordkit/core
[jsr_badge]: https://img.shields.io/jsr/v/@discordkit/core
[jsr]: https://jsr.io/@discordkit/core
[ci_badge]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml/badge.svg
[ci]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml
[client]: https://www.npmjs.com/package/@discordkit/client
[discord_api]: https://discord.com/developers/docs
[license]: https://github.com/discordkit/discordkit/blob/main/LICENSE.md
[personal-website]: https://saeris.gg
