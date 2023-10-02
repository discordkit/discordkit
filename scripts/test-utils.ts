import type React from "react";
import { createElement } from "react";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery
} from "@tanstack/react-query";
import { http } from "msw";
import { type SetupServer, setupServer } from "msw/node";
import type { GenerateMockOptions } from "@anatine/zod-mock";
import { generateMock } from "@anatine/zod-mock";
import type { z } from "zod";
import type { RenderHookResult } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import type { unsetMarker } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import {
  endpoint,
  type toQuery,
  type Fetcher,
  type toProcedure,
  snowflake
} from "@discordkit/core";
import { Snowflake } from "nodejs-snowflake";

type UnsetMarker = typeof unsetMarker;

export const msw: SetupServer = setupServer();

const uid = new Snowflake({ custom_epoch: 1420070400000 });

export const mockSchema = <T extends z.ZodTypeAny>(
  schema: T,
  opts?: Parameters<typeof generateMock>[1]
): z.infer<T> =>
  generateMock(schema, {
    ...opts,
    backupMocks: {
      ZodAny: (ref) => {
        // @ts-expect-error
        if (ref === (snowflake as z.ZodEffects<z.ZodAny>)._def.schema) {
          return uid.getUniqueID().toString();
        }
      }
    }
  });

const createMock =
  (type: keyof typeof http) =>
  <S extends z.ZodTypeAny>(
    path: string,
    responseSchema?: S,
    opts?: GenerateMockOptions
  ): z.infer<S> => {
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
  renderHook(fn, { wrapper: createWrapper(), ...options });

export const runQuery = <Q extends ReturnType<typeof toQuery>>(
  /** The Query function to Test */
  query: Q,
  /** The input variables of the Query function, if it accepts input */
  input?: Parameters<typeof query>["length"] extends 0
    ? never
    : Parameters<typeof query>[0]
): RenderHookResult<
  UseQueryResult<Awaited<ReturnType<ReturnType<Q>>>>,
  never
> =>
  runHook(() =>
    useQuery([query.name, input], input ? query(input) : query(null))
  );

export const runMutation = <
  S extends z.ZodTypeAny | null,
  R,
  M extends Fetcher<S, R>
>(
  mutation: M
): RenderHookResult<
  UseMutationResult<
    R,
    unknown,
    Parameters<typeof mutation>["length"] extends 0
      ? never
      : Parameters<typeof mutation>[0]
  >,
  never
> => runHook(() => useMutation(mutation));

export const runProcedure = <const T extends ReturnType<typeof toProcedure>>(
  procedure: T
): ReturnType<T>["_def"]["_input_in"] extends UnsetMarker
  ? () => Promise<ReturnType<T>["_def"]["_output_out"]>
  : (
      input: ReturnType<T>["_def"]["_input_in"]
    ) => Promise<ReturnType<T>["_def"]["_output_out"]> => {
  const tRPC = initTRPC.create();
  // @ts-expect-error
  return tRPC
    .router({
      [procedure.name]: procedure(tRPC.procedure)
    })
    .createCaller({})[procedure.name];
};
