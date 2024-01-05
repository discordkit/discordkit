import type { BaseSchema } from "valibot";
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
type FetchDirection = "backward" | "forward";
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
 */
export const toQuery =
  <S extends BaseSchema | null, R, T extends Fetcher<S, R>>(
    fn: T
  ): Parameters<T>["length"] extends 0
    ? () => QueryFunction<Awaited<ReturnType<T>>>
    : (config: Parameters<T>[0]) => QueryFunction<Awaited<ReturnType<T>>> =>
  // @ts-expect-error
  (...config: [unknown]) =>
  async () =>
    fn(...config);
