import type { z } from "zod";
import type {
  initTRPC,
  AnyRootConfig,
  inferParser,
  Procedure,
  unsetMarker
} from "@trpc/server";
import { isNonNullable } from "./isNonNullable.ts";
import type { Fetcher } from "./methods.ts";

type Result<T = void> = T extends z.ZodTypeAny ? z.infer<T> : T;

type ProcedureBuilder = ReturnType<(typeof initTRPC)["create"]>["procedure"];

type UnsetMarker = typeof unsetMarker;

type BaseProcedure<
  T extends "mutation" | "query" | "subscription",
  I extends z.ZodTypeAny | null = null,
  O extends z.ZodTypeAny | null = null
> = Procedure<
  T,
  {
    _config: AnyRootConfig;
    _ctx_out: object;
    _input_in: I extends z.ZodTypeAny ? inferParser<I>["in"] : UnsetMarker;
    _input_out: I extends z.ZodTypeAny ? inferParser<I>["out"] : UnsetMarker;
    _output_in: O extends z.ZodTypeAny ? inferParser<O>["in"] : UnsetMarker;
    _output_out: O extends z.ZodTypeAny ? inferParser<O>["out"] : UnsetMarker;
    _meta: object;
  }
>;

/**
 * Given a {@link Fetcher | Fetcher} function and it's associated input and
 * output Zod schemas, this produces a function which accepts a tRPC procedure
 * builder of the given procedure type. This can then be used in a tRPC router
 * to scaffold an API route to forward a request to Discord's API.
 */
export const toProcedure =
  <
    T extends "mutation" | "query" | "subscription",
    I extends z.ZodTypeAny | null = null,
    O extends z.ZodTypeAny | null = null
  >(
    type: T,
    fn: Fetcher<I extends z.ZodTypeAny ? I : z.ZodUnknown, Result<O>>,
    input?: I,
    output?: O
  ) =>
  (procedure: ProcedureBuilder): BaseProcedure<T, I, O> => {
    if (isNonNullable(input) && isNonNullable(output)) {
      // @ts-expect-error
      return procedure
        .input(input)
        .output(output)
        [type](async (opts) => fn(opts.input));
    }
    if (isNonNullable(input) && !isNonNullable(output)) {
      // @ts-expect-error
      return procedure.input(input)[type](async (opts) => fn(opts.input));
    }
    if (!isNonNullable(input) && isNonNullable(output)) {
      // @ts-expect-error
      return procedure.output(output)[type](async () => fn());
    }
    // @ts-expect-error
    return procedure[type](async () => fn());
  };
