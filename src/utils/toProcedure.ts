import type { z } from "zod";
import type {
  initTRPC,
  AnyRootConfig,
  inferParser,
  Procedure
} from "@trpc/server";
import type { Parser } from "@trpc/server/dist/core/parser";
import type { UnsetMarker } from "@trpc/server/dist/core/internals/utils";
import { isNonNullable } from "./isNonNullable";
import type { Fetcher } from "./types";

type Result<T> = T extends z.ZodTypeAny ? z.infer<T> : void;

type Base = ReturnType<(typeof initTRPC)["create"]>["procedure"];

type BaseProcedure<
  T extends "mutation" | "query" | "subscription",
  I extends Parser | null = null,
  O extends Parser | null = null
> = Procedure<
  T,
  {
    _config: AnyRootConfig;
    _ctx_out: object;
    _input_in: I extends Parser ? inferParser<I>["in"] : UnsetMarker;
    _input_out: I extends Parser ? inferParser<I>["out"] : UnsetMarker;
    _output_in: O extends Parser ? inferParser<O>["in"] : UnsetMarker;
    _output_out: O extends Parser ? inferParser<O>["out"] : UnsetMarker;
    _meta: object;
  }
>;

export const toProcedure =
  <
    T extends "mutation" | "query" | "subscription",
    I extends z.ZodTypeAny | null = null,
    O extends z.ZodTypeAny | null = null
  >(
    type: T,
    fn: Fetcher<I extends Parser ? I : z.ZodUnknown, Result<O>>,
    input?: I,
    output?: O
  ) =>
  (base: Base): BaseProcedure<T, I, O> => {
    if (isNonNullable(input) && isNonNullable(output)) {
      // @ts-expect-error
      return base
        .input(input)
        .output(output)
        [type](async (opts) => fn(opts.input));
    }
    if (isNonNullable(input) && !isNonNullable(output)) {
      // @ts-expect-error
      return base.input(input)[type](async (opts) => fn(opts.input));
    }
    if (!isNonNullable(input) && isNonNullable(output)) {
      // @ts-expect-error
      return base.output(output)[type](async () => fn());
    }
    // @ts-expect-error
    return base[type](async () => fn());
  };
