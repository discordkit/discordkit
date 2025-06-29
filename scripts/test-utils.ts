import type React from "react";
import { createElement } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  type UseQueryResult,
  type UseMutationResult
} from "@tanstack/react-query";
import type { GenericSchema, GenericSchemaAsync } from "valibot";
import type { RenderHookResult } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import type {
  AnyProcedure,
  inferProcedureInput,
  inferProcedureOutput
} from "@trpc/server/unstable-core-do-not-import";
import { initTRPC } from "@trpc/server";
import type { toQuery, Fetcher, toProcedure } from "@discordkit/core";

type Schema = GenericSchema | GenericSchemaAsync;

const createWrapper =
  (): React.FC<{ children: React.ReactNode }> =>
  ({ children }) =>
    createElement(QueryClientProvider, { client: new QueryClient() }, children);

const runHook: typeof renderHook = (fn, options) =>
  renderHook(fn, {
    wrapper: createWrapper(),
    ...options
  });

export const runQuery = <Q extends ReturnType<typeof toQuery>>(
  /** The Query function to Test */
  query: Q,
  /** The input variables of the Query function, if it accepts input */
  input?: Parameters<typeof query>[`length`] extends 0
    ? never
    : Parameters<typeof query>[0]
): RenderHookResult<
  UseQueryResult<Awaited<ReturnType<ReturnType<Q>>>>,
  never
> =>
  // @ts-expect-error
  runHook(() =>
    useQuery({
      queryKey: [query.name, input],
      queryFn: input ? query(input) : query(null)
    })
  );

export const runMutation = <
  S extends Schema | null,
  R,
  M extends Fetcher<S, R>
>(
  mutation: M
): RenderHookResult<
  UseMutationResult<
    R,
    unknown,
    Parameters<typeof mutation>[`length`] extends 0
      ? never
      : Parameters<typeof mutation>[0]
  >,
  never
  // @ts-expect-error
> => runHook(() => useMutation({ mutationFn: mutation }));

type DecorateProcedure<TProcedure extends AnyProcedure> = (
  input: inferProcedureInput<TProcedure>
) => Promise<inferProcedureOutput<TProcedure>>;

export const runProcedure = <const T extends ReturnType<typeof toProcedure>>(
  procedure: T
): DecorateProcedure<ReturnType<T>> => {
  const tRPC = initTRPC.create();
  const instance = procedure(tRPC.procedure);
  return tRPC
    .router({
      [procedure.name]: instance
    })
    .createCaller({})[procedure.name];
};
