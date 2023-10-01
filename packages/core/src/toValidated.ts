import type { z } from "zod";
import { isNonNullable } from "./isNonNullable.ts";
import { isObject } from "./isObject.ts";
import type { Fetcher } from "./types.ts";

const isSchema = (val: unknown): val is z.ZodTypeAny =>
  isNonNullable(val) && isObject(val) && `parse` in val;

type ToValidated = <
  F extends
    | Fetcher<null, null>
    | Fetcher<null, z.infer<z.ZodTypeAny>>
    | Fetcher<z.ZodTypeAny, z.infer<z.ZodTypeAny>>
    | Fetcher<z.ZodTypeAny>
>(
  ...args: F extends Fetcher<
    infer I,
    ReturnType<F> extends Promise<void>
      ? never
      : z.infer<infer O & z.ZodTypeAny>
  >
    ? [fn: F, input: I, output: O]
    : F extends Fetcher<
        null,
        ReturnType<F> extends Promise<void>
          ? never
          : z.infer<infer O & z.ZodTypeAny>
      >
    ? [fn: F, input: null, output: O]
    : F extends Fetcher<infer I>
    ? [fn: F, input: I]
    : F extends Fetcher<null, null>
    ? [fn: F]
    : never
) => F;

export const toValidated: ToValidated =
  (fn, input, output) =>
  // @ts-expect-error
  async (config) => {
    if (isSchema(input)) {
      input.parse(config);
    }

    const result = await fn(config);

    if (isSchema(output)) {
      output.parse(result);
    }

    return result;
  };
