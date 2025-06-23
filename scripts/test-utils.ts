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
import { http } from "msw";
import { type SetupServer, setupServer } from "msw/node";
import { Valimock, type ValimockOptions } from "valimock";
import type { GenericSchema, GenericSchemaAsync, InferOutput } from "valibot";
import type { RenderHookResult } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import type {
  AnyProcedure,
  inferProcedureInput,
  inferProcedureOutput
} from "@trpc/server/unstable-core-do-not-import";
import { initTRPC } from "@trpc/server";
import { Snowflake } from "nodejs-snowflake";
import {
  endpoint,
  type toQuery,
  type Fetcher,
  type toProcedure,
  snowflake
} from "@discordkit/core";

type Schema = GenericSchema | GenericSchemaAsync;

export const msw: SetupServer = setupServer();

const uid = new Snowflake({ custom_epoch: 1420070400000 });

export const mockSchema = <T extends Schema>(
  schema: T,
  opts?: Partial<ValimockOptions>
): InferOutput<T> =>
  new Valimock({
    ...opts,
    customMocks: {
      custom: (s): string | undefined => {
        if (s === snowflake) return uid.getUniqueID().toString();
      }
    }
  }).mock(schema);

const createMock =
  (type: keyof typeof http) =>
  <S extends GenericSchema>(
    path: string,
    responseSchema?: S,
    opts?: Partial<ValimockOptions>
  ): InferOutput<S> => {
    const result = responseSchema ? mockSchema(responseSchema, opts) : null;

    beforeAll(() => {
      msw.use(
        http[type](
          new URL(path.replace(/^\//, ``), endpoint).href,
          () =>
            new Response(JSON.stringify(result), {
              headers: {
                "Content-Type": `application/json`
              }
            })
        )
      );
    });

    return result;
  };

export const mockRequest = {
  delete: createMock(`delete`),
  get: createMock(`get`),
  patch: createMock(`patch`),
  post: createMock(`post`),
  put: createMock(`put`)
};

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
