import { type Fetcher } from "../methods.js";
import { toQuery } from "../toQuery.js";

describe(`toQuery`, () => {
  it(`wraps a no-input Fetcher in a curried queryFn`, async () => {
    const sentinel = { id: 42 };
    const getCurrentUser: Fetcher<null, typeof sentinel> = async () => sentinel;

    const query = toQuery(getCurrentUser);
    // The returned shape mirrors what react-query expects: a function that
    // takes the same input parameters as the Fetcher and returns a queryFn.
    const queryFn = (query as () => () => Promise<typeof sentinel>)();
    await expect(queryFn()).resolves.toBe(sentinel);
  });

  it(`wraps an input-accepting Fetcher in a curried queryFn`, async () => {
    interface Input {
      id: string;
    }
    const getUser: Fetcher<never, Input & { name: string }> = async (
      // @ts-expect-error – Fetcher's generic type uses `unknown` for input.
      input: Input
    ) => ({ id: input.id, name: `user-${input.id}` });

    // toQuery passes the config through to the underlying Fetcher.
    // @ts-expect-error – mocked Fetcher input type
    const query = toQuery(getUser);
    // @ts-expect-error – curried call signature
    const queryFn = query({ id: `123` });
    await expect(queryFn()).resolves.toEqual({ id: `123`, name: `user-123` });
  });
});
