type MaybeNullable<T> = T | (T | null);

export interface RequestBodyConfig {
  body: MaybeNullable<Record<string, unknown>>;
}

export interface RequestParamsConfig {
  params?: Record<string, unknown>;
}

export type CombinedRequestParamsConfig = RequestBodyConfig &
  RequestParamsConfig;

export type QueryConfig<T = {}> = T &
  (CombinedRequestParamsConfig | RequestBodyConfig | RequestParamsConfig | {});

export type QueryBuilder<T extends QueryConfig, R = void> = (
  config: T
) => Promise<R>;

export type MutationBuilder<T extends QueryConfig, R = void> = (
  config: T
) => Promise<R>;

export type Fetcher<T> = () => Promise<T>;
export type FetcherReturn<T extends (...args: unknown[]) => Fetcher<object>> =
  Awaited<ReturnType<ReturnType<T>>>;
