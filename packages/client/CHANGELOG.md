# @discordkit/client

## 2.0.0

### Major Changes

- [#12](https://github.com/discordkit/discordkit/pull/12) [`5562b2b`](https://github.com/discordkit/discordkit/commit/5562b2b367776e4e70f40be2297b19bea4206991) Thanks [@Saeris](https://github.com/Saeris)! - Migrate schemas from `zod` to `valibot`

  This update represents a major refactor of both the core and client library codebases.

  Since Valibot has now become stable, Discordkit is migrating away from `zod` in favor of `valibot` as it's schema library because of it's significantly lighter weight when bundling. This choice was made because Discordkit is designed to be used in a variety of environments such as edge functions, serverless runtimes, and directly on clients, all of which are places where every byte saved counts towards better performance. From the beginning, Discordkit was designed to be functional in nature, so that you'll only bundle what you import and consume, which is the shared ethos of Valibot.

  Along with this change comes some significant refinements to every schema, so that it closer matches the behavior of Discord's API. Work on updating these schemas to match the v10 API one to one is ongoing, and as such some of the latest field updates may not yet be reflected in Discordkit. These will be patched in incrementally following this release.

### Patch Changes

- Updated dependencies [[`5562b2b`](https://github.com/discordkit/discordkit/commit/5562b2b367776e4e70f40be2297b19bea4206991)]:
  - @discordkit/core@2.0.0

## 1.1.0-next.0

### Minor Changes

- Replace `zod` with `valibot`

### Patch Changes

- Updated dependencies []:
  - @discordkit/core@1.1.0-next.0

## 1.0.3

### Patch Changes

- [#9](https://github.com/discordkit/discordkit/pull/9) [`f973cc1`](https://github.com/discordkit/discordkit/commit/f973cc1b0b072d830d3e38fd291135bcd3f5c8c2) Thanks [@Saeris](https://github.com/Saeris)! - Added a new versioning script to workaround `@changeset/cli`'s inability to correctly run `yarn npm publish`, which accidentally leaves workspace protocol dependency versions unchanged and published to npm. Shoutout to https://github.com/PrairieLearn/PrairieLearn/pull/7533 for the fix.

- Updated dependencies [[`f973cc1`](https://github.com/discordkit/discordkit/commit/f973cc1b0b072d830d3e38fd291135bcd3f5c8c2)]:
  - @discordkit/core@1.0.3

## 1.0.2

### Patch Changes

- [#7](https://github.com/discordkit/discordkit/pull/7) [`2f4b55b`](https://github.com/discordkit/discordkit/commit/2f4b55b2d894e2295f8e6e2eb4fee9a97bbd0f6c) Thanks [@Saeris](https://github.com/Saeris)! - Actually fix missing build artifacts 😰

- Updated dependencies [[`2f4b55b`](https://github.com/discordkit/discordkit/commit/2f4b55b2d894e2295f8e6e2eb4fee9a97bbd0f6c)]:
  - @discordkit/core@1.0.2

## 1.0.1

### Patch Changes

- [#5](https://github.com/discordkit/discordkit/pull/5) [`3be92aa`](https://github.com/discordkit/discordkit/commit/3be92aa51a2e533e05cdef5b8e1954307c3e1699) Thanks [@Saeris](https://github.com/Saeris)! - Add missing cjs build artifacts.

- Updated dependencies [[`3be92aa`](https://github.com/discordkit/discordkit/commit/3be92aa51a2e533e05cdef5b8e1954307c3e1699)]:
  - @discordkit/core@1.0.1

## 1.0.0

### Major Changes

- [#3](https://github.com/discordkit/discordkit/pull/3) [`e371616`](https://github.com/discordkit/discordkit/commit/e37161619e6ff02c0ac792c5727030f09207c22f) Thanks [@Saeris](https://github.com/Saeris)! - # v1.0.0

  This marks the first major release of Discordkit! 🥳

  Since the first few commits to Discordkit were made, this release includes out of the box support for [`tRPC``](https://trpc.io/) and [`react-query``](https://tanstack.com/query/latest) alongside isomorphic use in a JavaScript/TypeScript project with the bare request handlers.

  Basic integration tests were added for every included API endpoint and all endpoints have had their schemas and doc comments updated to the latest v10 API specification.

  Some initial usage documentation has been added and will be improved over the next several weeks. This will include some basic examples of usage alongside popular frameworks and libraries. Use cases are still being explored for this initial release, and so the immediate priority is ensuring that the supporting release infrastructure is in working order.

  At this time there is _no support for file uploads_. Additionally, reason headers also cannot yet be set. Support for these will be added shortly.

### Patch Changes

- Updated dependencies [[`e371616`](https://github.com/discordkit/discordkit/commit/e37161619e6ff02c0ac792c5727030f09207c22f)]:
  - @discordkit/core@1.0.0
