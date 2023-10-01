import type { z } from "zod";

export type Maybe<T> = T | null | undefined;

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

export type Fetcher<
  S extends z.ZodTypeAny | null = null,
  R = void
> = S extends null
  ? () => Promise<R>
  : (config: z.infer<NonNullable<S>>) => Promise<R>;

export type MutationBuilder<T extends QueryConfig, R = void> = (
  config: T
) => Promise<R>;
