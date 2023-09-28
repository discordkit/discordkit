import type { QueryFunction } from "@tanstack/react-query";
import type { z } from "zod";
import type { Fetcher } from "./types.ts";

export const toQuery =
  <S extends z.ZodTypeAny | null, R, T extends Fetcher<S, R>>(
    fn: T
  ): Parameters<T>["length"] extends 0
    ? () => QueryFunction<Awaited<ReturnType<T>>>
    : (config: Parameters<T>[0]) => QueryFunction<Awaited<ReturnType<T>>> =>
  // @ts-expect-error
  (...config: [unknown]) =>
  async () =>
    fn(...config);
