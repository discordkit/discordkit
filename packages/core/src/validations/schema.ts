import * as v from "valibot";

/**
 * Annotate a schema's *published* type as `v.GenericSchema<T>` so
 * downstream `.d.ts` emit stops inlining the inner `ObjectSchema`'s
 * entries map and instead references `T` by name. The runtime value
 * is unchanged.
 *
 * Use at every type-defining schema export:
 *
 * ```ts
 * const _userSchema = v.object({...});
 * export interface User extends v.InferOutput<typeof _userSchema> {}
 * export const userSchema = schema<User>(_userSchema);
 * ```
 *
 * **Why this exists**
 *
 * Without annotation, `typeof userSchema` is the full
 * `v.ObjectSchema<{ id: v.GenericSchema<string>, ... }>` shape. Every
 * downstream file that references `userSchema` (Guild, Application,
 * Member, …) re-inlines that entries map into its own emitted
 * declarations. This causes:
 *
 *   - dramatic duplication of nested object shapes in `.d.ts` output
 *   - slow IDE hover (tsserver expands the full shape on every
 *     reference)
 *   - occasional TS2502 / type-too-complex errors on deeply circular
 *     schemas (Channel, Message, …)
 *
 * After annotation, downstream `.d.ts` files reference `User` by
 * name from `./user/types/User.d.mts` and never inline its body.
 *
 * **Trade-off**
 *
 * `v.partial(userSchema)`, `v.pick(userSchema, [...])`, `v.omit(...)`,
 * and `userSchema.entries.id` stop type-checking because the constraint
 * is `ObjectSchema<...>` not `GenericSchema<T>`. Use the
 * {@link partialSchema}, {@link pickFields}, {@link omitFields},
 * {@link requiredFields}, and {@link variantSchema} helpers below for
 * the common cases.
 *
 * @__NO_SIDE_EFFECTS__
 */
export const schema = <T>(s: v.GenericSchema<unknown>): v.GenericSchema<T> =>
  s as v.GenericSchema<T>;

/**
 * Make every key of `T` optional, both at the type level and at
 * runtime. Equivalent to Valibot's `v.partial`, but accepts an
 * annotated `GenericSchema<T>` (which `v.partial` would reject because
 * its constraint is `ObjectSchema<...>`).
 *
 * @__NO_SIDE_EFFECTS__
 */
export const partialSchema = <T>(
  s: v.GenericSchema<T>
): v.GenericSchema<Partial<T>> =>
  // The runtime cast is sound: schema<T>(...) returns an ObjectSchema
  // we only annotated as GenericSchema. v.partial reads from
  // ObjectSchema.entries, which is still there.
  v.partial(
    s as unknown as v.ObjectSchema<v.ObjectEntries, undefined>
  ) as unknown as v.GenericSchema<Partial<T>>;

/**
 * Pick a subset of fields from `T` at both type and runtime levels.
 * Equivalent to Valibot's `v.pick`. See {@link partialSchema}.
 *
 * @__NO_SIDE_EFFECTS__
 */
export const pickFields = <T, K extends keyof T & string>(
  s: v.GenericSchema<T>,
  keys: readonly K[]
): v.GenericSchema<Pick<T, K>> => {
  type Erased = v.ObjectSchema<v.ObjectEntries, undefined>;
  return v.pick(
    s as unknown as Erased,
    keys as unknown as v.ObjectKeys<Erased>
  ) as unknown as v.GenericSchema<Pick<T, K>>;
};

/**
 * Omit a subset of fields from `T` at both type and runtime levels.
 * Equivalent to Valibot's `v.omit`. See {@link partialSchema}.
 *
 * @__NO_SIDE_EFFECTS__
 */
export const omitFields = <T, K extends keyof T & string>(
  s: v.GenericSchema<T>,
  keys: readonly K[]
): v.GenericSchema<Omit<T, K>> => {
  type Erased = v.ObjectSchema<v.ObjectEntries, undefined>;
  return v.omit(
    s as unknown as Erased,
    keys as unknown as v.ObjectKeys<Erased>
  ) as unknown as v.GenericSchema<Omit<T, K>>;
};

/**
 * Mark a subset of fields on `T` as required at both type and runtime
 * levels. Equivalent to Valibot's `v.required`. See {@link partialSchema}.
 *
 * @__NO_SIDE_EFFECTS__
 */
export const requiredFields = <T, K extends keyof T & string>(
  s: v.GenericSchema<T>,
  keys: readonly K[]
): v.GenericSchema<T & Required<Pick<T, K>>> => {
  type Erased = v.ObjectSchema<v.ObjectEntries, undefined>;
  return v.required(
    s as unknown as Erased,
    keys as unknown as v.ObjectKeys<Erased>
  ) as unknown as v.GenericSchema<T & Required<Pick<T, K>>>;
};

/**
 * Build a discriminated union schema. Equivalent to Valibot's
 * `v.variant`, but accepts annotated `GenericSchema<T>` variants
 * (which `v.variant` would reject because its constraint is
 * `ObjectSchema<...>`).
 *
 * Prefer `v.variant` whenever variants share a literal discriminator
 * field — it dispatches on that field at runtime, producing focused
 * error messages and O(1) validation, vs. {@link v.union}'s O(n)
 * try-each behavior.
 *
 * @example
 * ```ts
 * export const channelSchema = variantSchema<Channel>(`type`, [
 *   guildTextChannelSchema,
 *   guildVoiceChannelSchema,
 *   threadChannelSchema,
 *   // ...
 * ]);
 * ```
 *
 * @__NO_SIDE_EFFECTS__
 */
export const variantSchema = <T>(
  key: keyof T & string,
  schemas: ReadonlyArray<v.GenericSchema<unknown>>
): v.GenericSchema<T> => {
  type Erased = v.ObjectSchema<v.ObjectEntries, undefined>;
  return v.variant(
    key as never,
    schemas as unknown as [Erased, Erased, ...Erased[]]
  ) as unknown as v.GenericSchema<T>;
};
