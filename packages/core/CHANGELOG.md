# @discordkit/core

## 1.0.1

### Patch Changes

- [#5](https://github.com/discordkit/discordkit/pull/5) [`3be92aa`](https://github.com/discordkit/discordkit/commit/3be92aa51a2e533e05cdef5b8e1954307c3e1699) Thanks [@Saeris](https://github.com/Saeris)! - Add missing cjs build artifacts.

## 1.0.0

### Major Changes

- [#3](https://github.com/discordkit/discordkit/pull/3) [`e371616`](https://github.com/discordkit/discordkit/commit/e37161619e6ff02c0ac792c5727030f09207c22f) Thanks [@Saeris](https://github.com/Saeris)! - # v1.0.0

  This marks the first major release of Discordkit! 🥳

  Since the first few commits to Discordkit were made, this release includes out of the box support for [`tRPC``](https://trpc.io/) and [`react-query``](https://tanstack.com/query/latest) alongside isomorphic use in a JavaScript/TypeScript project with the bare request handlers.

  Basic integration tests were added for every included API endpoint and all endpoints have had their schemas and doc comments updated to the latest v10 API specification.

  Some initial usage documentation has been added and will be improved over the next several weeks. This will include some basic examples of usage alongside popular frameworks and libraries. Use cases are still being explored for this initial release, and so the immediate priority is ensuring that the supporting release infrastructure is in working order.

  At this time there is _no support for file uploads_. Additionally, reason headers also cannot yet be set. Support for these will be added shortly.
