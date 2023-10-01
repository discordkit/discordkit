import type { z } from "zod";
import type {
  initTRPC,
  AnyRootConfig,
  inferParser,
  Procedure,
  unsetMarker
} from "@trpc/server";
import { isNonNullable } from "./isNonNullable.ts";
import type { Fetcher } from "./types.ts";

type Result<T = void> = T extends z.ZodTypeAny ? z.infer<T> : T;

export type Base = ReturnType<(typeof initTRPC)["create"]>["procedure"];

type UnsetMarker = typeof unsetMarker;

export type BaseProcedure<
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

export type ToProcedure<
  T extends "mutation" | "query" | "subscription" = "query",
  I extends z.ZodTypeAny | null = null,
  O extends z.ZodTypeAny | null = null
> = (
  type: T,
  fn: Fetcher<I extends z.ZodTypeAny ? I : z.ZodUnknown, Result<O>>,
  input?: I,
  output?: O
) => (base: Base) => BaseProcedure<T, I, O>;

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
