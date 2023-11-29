import type { BaseSchema, Output } from "valibot";
import { isNonNullable } from "./isNonNullable.js";
import { isObject } from "./isObject.js";
import type { Fetcher } from "./methods.js";

const isSchema = (val: unknown): val is BaseSchema =>
  isNonNullable(val) && isObject(val) && `_parse` in val;

type ToValidated = <
  F extends
    | Fetcher<BaseSchema, Output<BaseSchema>>
    | Fetcher<BaseSchema>
    | Fetcher<null, null>
    | Fetcher<null, Output<BaseSchema>>
>(
  ...args: F extends Fetcher<
    infer I,
    ReturnType<F> extends Promise<void> ? never : Output<BaseSchema & infer O>
  >
    ? [fn: F, input: I, output: O]
    : F extends Fetcher<
        null,
        ReturnType<F> extends Promise<void>
          ? never
          : Output<BaseSchema & infer O>
      >
    ? [fn: F, input: null, output: O]
    : F extends Fetcher<infer I>
    ? [fn: F, input: I]
    : F extends Fetcher<null, null>
    ? [fn: F]
    : never
) => F;

/**
 * Given a {@link Fetcher | Fetcher} function and it's associated input
 * and output Zod schemas, this returns a new validated {@link Fetcher | Fetcher} function which will validate it's input and result at runtime.
 * This is useful in contexts where you want strong guarantees on runtime
 * type-safety when dealing with raw user input in a framework agnostic
 * environment.
 */
export const toValidated: ToValidated =
  (fn, input, output) =>
  // @ts-expect-error
  async (config) => {
    if (isSchema(input)) {
      input._parse(config);
    }

    const result = await fn(config);

    if (isSchema(output)) {
      output._parse(result);
    }

    return result;
  };
