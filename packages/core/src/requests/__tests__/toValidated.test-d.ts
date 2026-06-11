import { assertType, describe, expectTypeOf, it } from "vite-plus/test";
import * as v from "valibot";
import type { Fetcher, RequestOptionsFor } from "../methods.js";
import { toValidated } from "../toValidated.js";

/**
 * Type-only tests for {@link toValidated} and {@link Fetcher}.
 * These are executed by `vitest --typecheck`; the runtime body is irrelevant.
 *
 * Goals:
 * 1. `toValidated` must preserve the third `C` capability generic of `Fetcher`.
 * 2. A `{ anonymous: true }` capability must make the per-call `options` arg
 *    *required* and must reject `{ anonymous: false }` or its absence.
 * 3. A `{ auditLogReason: true }` capability must make `{ reason: string }`
 *    permitted, but optional, and must reject it for endpoints without it.
 * 4. A capability-free `Fetcher` must accept neither flag.
 */
describe(`fetcher / toValidated type surface`, () => {
  const schema = v.object({ id: v.string() });
  type Schema = typeof schema;

  it(`preserves capabilities through toValidated for { anonymous: true }`, () => {
    const fn: Fetcher<Schema, void, { anonymous: true }> = async () =>
      Promise.resolve(undefined);
    const wrapped = toValidated(fn, schema);

    // options arg is REQUIRED
    expectTypeOf<Parameters<typeof wrapped>>().toEqualTypeOf<
      [{ id: string }, RequestOptionsFor<{ anonymous: true }>]
    >();

    // { anonymous: true } is accepted
    assertType<Promise<void>>(wrapped({ id: `1` }, { anonymous: true }));

    // @ts-expect-error — missing required options arg
    void wrapped({ id: `1` });
    // @ts-expect-error — anonymous: false rejected
    void wrapped({ id: `1` }, { anonymous: false });
  });

  it(`preserves capabilities through toValidated for { auditLogReason: true }`, () => {
    const fn: Fetcher<Schema, void, { auditLogReason: true }> = async () =>
      Promise.resolve(undefined);
    const wrapped = toValidated(fn, schema);

    // options arg is OPTIONAL — reason is opt-in
    assertType<Promise<void>>(wrapped({ id: `1` }));
    assertType<Promise<void>>(wrapped({ id: `1` }, { reason: `cleanup pass` }));

    // @ts-expect-error — anonymous not permitted on this endpoint
    void wrapped({ id: `1` }, { anonymous: true });
  });

  it(`accepts both capabilities together`, () => {
    const fn: Fetcher<
      Schema,
      void,
      { anonymous: true; auditLogReason: true }
    > = async () => Promise.resolve(undefined);
    const wrapped = toValidated(fn, schema);

    // anonymous required, reason optional
    assertType<Promise<void>>(wrapped({ id: `1` }, { anonymous: true }));
    assertType<Promise<void>>(
      wrapped({ id: `1` }, { anonymous: true, reason: `cleanup` })
    );

    // @ts-expect-error — anonymous still required
    void wrapped({ id: `1` });
    // @ts-expect-error — reason without anonymous is incomplete
    void wrapped({ id: `1` }, { reason: `cleanup` });
  });

  it(`rejects both flags on a capability-free Fetcher`, () => {
    const fn: Fetcher<Schema> = async () => Promise.resolve(undefined);
    const wrapped = toValidated(fn, schema);

    // bare call is OK
    assertType<Promise<void>>(wrapped({ id: `1` }));
    // empty options OK
    assertType<Promise<void>>(wrapped({ id: `1` }, {}));

    // @ts-expect-error — anonymous not permitted
    void wrapped({ id: `1` }, { anonymous: true });
    // @ts-expect-error — reason not permitted
    void wrapped({ id: `1` }, { reason: `nope` });
  });

  it(`preserves the schema-less branch (no config arg)`, () => {
    const fn: Fetcher<null, string, { anonymous: true }> = async () =>
      Promise.resolve(`result`);
    const wrapped = toValidated(fn);

    // Only options arg, and it's required
    expectTypeOf<Parameters<typeof wrapped>>().toEqualTypeOf<
      [RequestOptionsFor<{ anonymous: true }>]
    >();
    assertType<Promise<string>>(wrapped({ anonymous: true }));

    // @ts-expect-error — must provide options
    void wrapped();
  });
});
