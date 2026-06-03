import {
  type GenericSchema,
  type GenericSchemaAsync,
  isOfKind,
  safeParseAsync,
  summarize
} from "valibot";
import type { Fetcher, FetcherCapabilities } from "./methods.js";

/**
 * Given a {@link Fetcher | Fetcher} function and it's associated input
 * and output Zod schemas, this returns a new validated {@link Fetcher | Fetcher} function which will validate it's input and result at runtime.
 * This is useful in contexts where you want strong guarantees on runtime
 * type-safety when dealing with raw user input in a framework agnostic
 * environment.
 *
 * @__NO_SIDE_EFFECTS__
 */
export const toValidated = <
  S extends GenericSchema | GenericSchemaAsync | null = null,
  R = void,
  C extends FetcherCapabilities = {}
>(
  fn: Fetcher<S, R, C>,
  input?: S | null,
  output?: GenericSchema<unknown, R> | GenericSchemaAsync<unknown, R>
): Fetcher<S, R, C> =>
  new Proxy<Fetcher<S, R, C>>(fn, {
    async apply(target, _, [config, options]): Promise<R> {
      // Validate the fetcher args before fetching
      if (input && isOfKind(`schema`, input)) {
        const { issues } = await safeParseAsync(input, config);
        if (issues) {
          throw new Error(
            `Failed to parse input schema: ${input.reference.name}\n\n${summarize(issues)}`
          );
        }
      }

      // Forward the per-call options (anonymous, reason) to the underlying
      // fetcher. The proxy was previously dropping the second argument.
      // oxlint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const call = target as unknown as (
        ...args: unknown[]
      ) => Promise<unknown>;
      const result = (await call(config, options)) as R;

      // Validate the result of the fetch call before returning
      if (output && isOfKind(`schema`, output)) {
        const { issues } = await safeParseAsync(output, result);
        if (issues) {
          throw new Error(
            `Failed to parse input schema: ${output.reference.name}\n\n${summarize(issues)}`
          );
        }
      }

      return result;
    }
  });
