import * as v from "valibot";
import { type Fetcher } from "../methods.js";
import { toQuery } from "../toQuery.js";

describe(`toQuery`, () => {
  it(`wraps a no-input Fetcher in a curried queryFn`, async () => {
    const sentinel = { id: 42 };
    const getCurrentUser: Fetcher<null, typeof sentinel> = async () => sentinel;

    // The returned shape mirrors what react-query expects: a function that
    // takes the same input parameters as the Fetcher and returns a queryFn.
    // TS's Parameters<T>['length'] conditional has trouble narrowing the
    // null-input case, so cast through `unknown` for both call sites here.
    const query = toQuery(getCurrentUser) as unknown as () => () => Promise<typeof sentinel>;
    const queryFn = query();
    await expect(queryFn()).resolves.toBe(sentinel);
  });

  it(`wraps an input-accepting Fetcher in a curried queryFn`, async () => {
    const inputSchema = v.object({ id: v.string() });
    const getUser: Fetcher<typeof inputSchema, { id: string; name: string }> = async ({
      id
    }) => ({ id, name: `user-${id}` });

    // toQuery passes the config through to the underlying Fetcher.
    const query = toQuery(getUser) as unknown as (
      input: { id: string }
    ) => () => Promise<{ id: string; name: string }>;
    const queryFn = query({ id: `123` });
    await expect(queryFn()).resolves.toEqual({ id: `123`, name: `user-123` });
  });
});
