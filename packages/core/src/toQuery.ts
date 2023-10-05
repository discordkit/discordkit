import type { QueryFunction } from "@tanstack/react-query";
import type { z } from "zod";
import type { Fetcher } from "./methods.js";

/**
 * Given a {@link Fetcher | Fetcher} function, transforms it into a curried function
 * which can then be used with React-Query as a query function without
 * the need for any additional boilerplate.
 */
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
