---
"@discordkit/core": major
"@discordkit/client": major
---

## "Pattern B" schema typing — `schema<T>`, `partialSchema`, `pickFields`/`omitFields`/`requiredFields`, `variantSchema`

`@discordkit/core` adds six new helpers under `@discordkit/core/validations/schema` that change how `@discordkit/client` declares the types of its exported schemas. The goal: stop downstream `.d.ts` files from inlining the entire entries map of every schema they reference.

### Why this exists

In v3.x, the type of every published schema was the full `v.ObjectSchema<{ id: v.GenericSchema<string>, ... }>` shape. Every consumer file that imported a schema re-inlined that entries map into its own emitted declarations. The result:

- Dramatic duplication of nested object shapes in `.d.ts` output
- Slow IDE hover (tsserver expands the full shape on every reference)
- Occasional TS2502 / "type too complex" errors on deeply circular schemas (Channel, Message, Interaction)

The fix: annotate the published type as `v.GenericSchema<T>` so downstream `.d.ts` references `T` by name instead of inlining it.

### What's new

```ts
import {
  schema,
  partialSchema,
  pickFields,
  omitFields,
  requiredFields,
  variantSchema
} from "@discordkit/core/validations/schema";

const _userSchema = v.object({
  /* ... */
});
export interface User extends v.InferOutput<typeof _userSchema> {}
export const userSchema = schema<User>(_userSchema);
```

- `schema<T>(s)` — type-erases the runtime schema to `v.GenericSchema<T>`. Runtime unchanged.
- `partialSchema<T>(s)`, `pickFields<T, K>(s, keys)`, `omitFields<T, K>(s, keys)`, `requiredFields<T, K>(s, keys)` — replacements for `v.partial` / `v.pick` / `v.omit` / `v.required` that accept type-erased `GenericSchema<T>` (which the raw Valibot functions reject because their constraint is `ObjectSchema<...>`).
- `variantSchema<T>(key, schemas)` — replacement for `v.variant` that accepts erased variants. Preferred over `v.union` for discriminated unions because it dispatches in O(1) by the discriminator field.

All six are annotated with `@__NO_SIDE_EFFECTS__` so tree-shakers can drop unused calls.

### Trade-offs

After annotation, `v.partial(userSchema)`, `v.pick(userSchema, [...])`, and direct field-access patterns like `userSchema.entries.id` stop type-checking. Use the equivalent helpers above for the common cases.

### `@discordkit/client` sweep

Every exported schema in `@discordkit/client` is now annotated through `schema<T>`. Discriminated unions (Component, ModerationAction, Channel, etc.) use `variantSchema` and dispatch on their discriminator field instead of trying each branch.

### Migration

Most consumer code is unaffected — `getGuildSchema`, `guildSchema`, etc. still validate the same shapes at runtime. Only consumers that **manipulate the schema value** at the type level (e.g. via `v.partial`/`v.pick`/`schema.entries`) need the new helpers:

```ts
// Before
const patchSchema = v.partial(modifyGuildSchema);

// After
import { partialSchema } from "@discordkit/core/validations/schema";
const patchSchema = partialSchema(modifyGuildSchema);
```
