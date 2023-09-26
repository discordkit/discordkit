import React from "react";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery
} from "@tanstack/react-query";
import { rest } from "msw";
import { setupServer } from "msw/node";
import type { GenerateMockOptions } from "@anatine/zod-mock";
import { generateMock } from "@anatine/zod-mock";
import type { z } from "zod";
import type { RenderHookResult } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { initTRPC } from "@trpc/server";
import type { UnsetMarker } from "@trpc/server/dist/core/internals/utils";
import { endpoint } from "../src/DiscordSession";
import type { toQuery, Fetcher, toProcedure } from "../src/utils";

export const msw = setupServer();

const createMock =
  (type: `delete` | `get` | `patch` | `post` | `put` = `get`) =>
  <S extends z.ZodTypeAny>(
    path: string,
    responseSchema?: S,
    // eslint-disable-next-line no-undefined
    opts: GenerateMockOptions | undefined = undefined
  ): z.infer<S> => {
    const result = responseSchema ? generateMock(responseSchema, opts) : null;

    beforeEach(() => {
      msw.use(
        rest[type](
          new URL(path.replace(/^\//, ``), endpoint).href,
          (_, res, ctx) => res(ctx.json(result))
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
    React.createElement(
      QueryClientProvider,
      { client: new QueryClient() },
      children
    );

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
