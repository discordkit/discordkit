import {
  type GenericSchema,
  type GenericSchemaAsync,
  type InferOutput,
  isOfKind,
  safeParseAsync,
  summarize
} from "valibot";
import type { Fetcher } from "./methods.js";

type InferFetcherSchema<F> = F extends Fetcher<infer S, unknown> ? S : never;
type InferFetcherReturn<F> =
  F extends Fetcher<GenericSchema | GenericSchemaAsync | null, infer R>
    ? R
    : never;

/**
 * Given a {@link Fetcher | Fetcher} function and it's associated input
 * and output Zod schemas, this returns a new validated {@link Fetcher | Fetcher} function which will validate it's input and result at runtime.
 * This is useful in contexts where you want strong guarantees on runtime
 * type-safety when dealing with raw user input in a framework agnostic
 * environment.
 */
export const toValidated = <
  F extends
    | Fetcher<
        GenericSchema | GenericSchemaAsync,
        InferOutput<GenericSchema | GenericSchemaAsync>
      >
    | Fetcher<GenericSchema | GenericSchemaAsync>
    | Fetcher<null, null>
    | Fetcher<null, InferOutput<GenericSchema | GenericSchemaAsync>>
>(
  fn: F,
  input?: InferFetcherSchema<F> | null,
  output?:
    | GenericSchema<unknown, InferFetcherReturn<F>>
    | GenericSchemaAsync<unknown, InferFetcherReturn<F>>
): F =>
  new Proxy<F>(fn, {
    async apply(target, _, [config]): Promise<ReturnType<F>> {
      // Validate the fetcher args before fetching
      if (input && isOfKind(`schema`, input)) {
        const { issues } = await safeParseAsync(input, config);
        if (issues) {
          throw new Error(
            `Failed to parse input schema: ${input.reference.name}\n\n${summarize(issues)}`
          );
        }
      }

      const result = await target(config);

      // Validate the result of the fetch call before returning
      if (output && isOfKind(`schema`, output)) {
        const { issues } = await safeParseAsync(output, result);
        if (issues) {
          throw new Error(
            `Failed to parse input schema: ${output.reference.name}\n\n${summarize(issues)}`
          );
        }
      }

      return result as ReturnType<F>;
    }
  });
