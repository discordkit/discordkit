import type {
  GenericSchema,
  GenericSchemaAsync,
  InferInput,
  InferOutput
} from "valibot";
import type {
  AnyProcedureBuilder,
  MutationProcedure,
  ProcedureType,
  QueryProcedure,
  SubscriptionProcedure
} from "@trpc/server/unstable-core-do-not-import";
import { isNonNullable } from "../utils/isNonNullable.js";
import type { Fetcher } from "./methods.js";

type Result<T = void> = T extends GenericSchema | GenericSchemaAsync
  ? InferOutput<T>
  : T;

type Schema = GenericSchema | GenericSchemaAsync;

type ProvedureDef<
  I extends Schema | null = null,
  O extends Schema | null = null
> = I extends Schema
  ? O extends Schema
    ? {
        input: InferInput<I>;
        output: InferOutput<O>;
        meta: unknown;
      }
    : { input: InferInput<I>; output: undefined; meta: unknown }
  : O extends Schema
    ? { input: undefined; output: InferOutput<O>; meta: unknown }
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
    I extends GenericSchema | GenericSchemaAsync | null = null,
    O extends GenericSchema | GenericSchemaAsync | null = null
  >(
    type: T,
    fn: Fetcher<
      I extends GenericSchema | GenericSchemaAsync ? I : null,
      Result<O>
    >,
    input?: I,
    output?: O
  ) =>
  (procedure: AnyProcedureBuilder): BaseProcedure<T, I, O> => {
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
