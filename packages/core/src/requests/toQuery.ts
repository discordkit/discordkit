import type { Fetcher } from "./methods.js";

/* Lifted from @tanstack/react-query */
// Intentional declaration-merging surface: consumers extend `Register`
// to override `queryMeta` and other framework-wide types.
// oxlint-disable-next-line typescript/no-empty-object-type
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
 *
 * @__NO_SIDE_EFFECTS__
 */
// Two overloads disambiguate the no-input vs input-accepting Fetcher
// shapes. Under strict mode, a single signature with a conditional return
// type forces TS to check the argument against the union of both branches
// at the call site, which fails on contravariant param positions.
// Overloads let inference pick one branch at a time.
//
// The second overload uses a structural shape `(config: TConfig, options?:
// unknown) => Promise<R>` rather than `Fetcher<S, R>` so TS can infer
// `TConfig` directly from the supplied callback's first parameter — going
// through `Fetcher<S, R>` would require TS to first invert the conditional
// type `S extends null ? ... : ...` to recover `S`, which it gives up on.
// The runtime check is unchanged (the implementation casts internally), so
// the looser structural type doesn't widen what consumers can pass in any
// meaningful way — every endpoint Fetcher in the codebase is shaped this
// way already.
export function toQuery<R>(fn: Fetcher<null, R>): () => QueryFunction<R>;
export function toQuery<TConfig, R>(
  fn: (config: TConfig, options?: never) => Promise<R>
): (config: TConfig) => QueryFunction<R>;
export function toQuery<R>(
  fn: (...args: never[]) => Promise<R>
): (...config: [unknown]) => QueryFunction<R> {
  return (...config: [unknown]) =>
    async () => {
      const call = fn as unknown as (...args: unknown[]) => Promise<R>;
      return call(...config);
    };
}
