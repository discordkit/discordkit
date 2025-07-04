import type * as v from "valibot";
import type {
  AnyProcedureBuilder,
  MutationProcedure,
  ProcedureType,
  QueryProcedure,
  SubscriptionProcedure
} from "@trpc/server/unstable-core-do-not-import";
import { isNonNullable } from "../utils/isNonNullable.js";
import type { Fetcher } from "./methods.js";

type Result<T = void> = T extends v.GenericSchema | v.GenericSchemaAsync
  ? v.InferOutput<T>
  : T;

type Schema = v.GenericSchema | v.GenericSchemaAsync;

type ProvedureDef<
  I extends Schema | null = null,
  O extends Schema | null = null
> = I extends Schema
  ? O extends Schema
    ? {
        input: v.InferInput<I>;
        output: v.InferOutput<O>;
        meta: unknown;
      }
    : { input: v.InferInput<I>; output: undefined; meta: unknown }
  : O extends Schema
    ? { input: undefined; output: v.InferOutput<O>; meta: unknown }
    : {
        input: undefined;
        output: undefined;
        meta: unknown;
      };

type BaseProcedure<
  T extends ProcedureType,
  I extends Schema | null = null,
  O extends Schema | null = null
> = T extends `query`
  ? QueryProcedure<ProvedureDef<I, O>>
  : T extends `mutation`
    ? MutationProcedure<ProvedureDef<I, O>>
    : SubscriptionProcedure<ProvedureDef<I, O>>;

/**
 * Given a {@link Fetcher | Fetcher} function and it's associated input and
 * output Zod schemas, this produces a function which accepts a tRPC procedure
 * builder of the given procedure type. This can then be used in a tRPC router
 * to scaffold an API route to forward a request to Discord's API.
 */
export const toProcedure =
  <
    T extends ProcedureType,
    I extends Schema | null = null,
    O extends Schema | null = null
  >(
    type: T,
    fn: Fetcher<I extends Schema ? I : null, Result<O>>,
    input?: I,
    output?: O
  ) =>
  (
    procedure: AnyProcedureBuilder,
    errorHandler?: (error: unknown) => void
  ): BaseProcedure<T, I, O> => {
    try {
      if (isNonNullable(input) && isNonNullable(output)) {
        // @ts-expect-error
        return procedure
          .input(input)
          .output(output)
          [type](async (opts: { input: unknown }) => fn(opts.input));
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
    } catch (error: unknown) {
      if (typeof errorHandler === `function`) {
        errorHandler(error);
      }
      throw new Error(`Unhandled Procedure Error!`, {
        cause: error
      });
    }
  };
