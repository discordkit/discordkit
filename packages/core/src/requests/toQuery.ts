import type { GenericSchema } from "valibot";
import type { Fetcher } from "./methods.js";

/* Lifted from @tanstack/react-query */
interface Register {}
type QueryKey = readonly unknown[];
type QueryMeta = Register extends {
  queryMeta: infer TQueryMeta;
}
  ? TQueryMeta extends Record<string, unknown>
    ? TQueryMeta
    : Record<string, unknown>
  : Record<string, unknown>;
type FetchDirection = `backward` | `forward`;
type QueryFunctionContext<
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never
> = [TPageParam] extends [never]
  ? {
      queryKey: TQueryKey;
      signal: AbortSignal;
      meta: QueryMeta | undefined;
    }
  : {
      queryKey: TQueryKey;
      signal: AbortSignal;
      pageParam: TPageParam;
      direction: FetchDirection;
      meta: QueryMeta | undefined;
    };
export type QueryFunction<
  T = unknown,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never
> = (context: QueryFunctionContext<TQueryKey, TPageParam>) => Promise<T> | T;

/**
 * Given a {@link Fetcher | Fetcher} function, transforms it into a curried function
 * which can then be used with React-Query as a query function without
 * the need for any additional boilerplate.
 *
 * Capability-free fetchers only — endpoints that require `{ anonymous: true }`
 * or accept `{ reason: string }` cannot currently be wrapped via this helper,
 * because react-query has no natural channel for those per-call options.
 */
export const toQuery =
  <S extends GenericSchema | null, R, T extends Fetcher<S, R>>(
    fn: T
  ): Parameters<T>[`length`] extends 0
    ? () => QueryFunction<Awaited<ReturnType<T>>>
    : (config: Parameters<T>[0]) => QueryFunction<Awaited<ReturnType<T>>> =>
  // @ts-expect-error
  (...config: [unknown]) =>
  async () => {
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const call = fn as unknown as (
      ...args: unknown[]
    ) => Promise<Awaited<ReturnType<T>>>;
    return call(...config);
  };
