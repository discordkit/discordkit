---
"@discordkit/client": minor
"@discordkit/core": minor
---

## Reduce generated types complexity with new core schemas

This update is mainly internal refactoring. It introduces some new custom schemas to `@discordkit/core` that help to reduce overall type complexity in the generated types. This is accomplished by encapsulating common validation patterns into reusable schemas, which are then coerced to simple types which mask the complexity of their pipelines. As an end-user, this would make no difference in the runtime validation behavior, nor would it change the shape of the types you consume. However it does obfuscate the internal types of most schemas, which would make them a little more difficult to hook into and make modifications to.
