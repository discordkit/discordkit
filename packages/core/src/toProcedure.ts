import type { BaseSchema, Output } from "valibot";
import type {
  initTRPC,
  AnyRootConfig,
  inferParser,
  Procedure,
  unsetMarker
} from "@trpc/server";
import { wrap, type Wrap } from "./wrap.js";
import { isNonNullable } from "./isNonNullable.js";
import type { Fetcher } from "./methods.js";

type Result<T = void> = T extends BaseSchema ? Output<T> : T;

type ProcedureBuilder = ReturnType<(typeof initTRPC)["create"]>["procedure"];

type UnsetMarker = typeof unsetMarker;

type BaseProcedure<
  T extends "mutation" | "query" | "subscription",
  I extends BaseSchema | null = null,
  O extends BaseSchema | null = null
> = Procedure<
  T,
  {
    _config: AnyRootConfig;
    _ctx_out: object;
    _input_in: I extends BaseSchema ? inferParser<Wrap<I>>["in"] : UnsetMarker;
    _input_out: I extends BaseSchema
      ? inferParser<Wrap<I>>["out"]
      : UnsetMarker;
    _output_in: O extends BaseSchema ? inferParser<Wrap<O>>["in"] : UnsetMarker;
    _output_out: O extends BaseSchema
      ? inferParser<Wrap<O>>["out"]
      : UnsetMarker;
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
    I extends BaseSchema | null = null,
    O extends BaseSchema | null = null
  >(
    type: T,
    fn: Fetcher<I extends BaseSchema ? I : null, Result<O>>,
    input?: I,
    output?: O
  ) =>
  (procedure: ProcedureBuilder): BaseProcedure<T, I, O> => {
    if (isNonNullable(input) && isNonNullable(output)) {
      // @ts-expect-error
      return procedure
        .input(wrap(input))
        .output(wrap(output))
        [type](async (opts) => fn(opts.input));
    }
    if (isNonNullable(input) && !isNonNullable(output)) {
      // @ts-expect-error
      return procedure.input(wrap(input))[type](async (opts) => fn(opts.input));
    }
    if (!isNonNullable(input) && isNonNullable(output)) {
      // @ts-expect-error
      return procedure.output(wrap(output))[type](async () => fn());
    }
    // @ts-expect-error
    return procedure[type](async () => fn());
  };
