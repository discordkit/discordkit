import type { z } from "zod";

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

export type Fetcher<S extends z.ZodTypeAny, R = void> = (
  config: z.infer<S>
) => Promise<R>;

export type MutationBuilder<T extends QueryConfig, R = void> = (
  config: T
) => Promise<R>;
