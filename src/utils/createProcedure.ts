import type { z } from "zod";
import type { initTRPC } from "@trpc/server";
import type { Fetcher } from "./types";

const toProcedure =
  <T, S extends z.ZodTypeAny = z.ZodTypeAny>(fn: Fetcher<S, T>) =>
  async ({ input }: { input: z.infer<S> }): Promise<T> =>
    fn(input);

type Result<T> = T extends z.ZodTypeAny ? z.infer<T> : void;

export const createProcedure =
  <
    I extends z.ZodTypeAny = z.ZodUnknown,
    O extends z.ZodTypeAny | undefined = undefined
  >(
    type: `mutation` | `query`,
    fn: Fetcher<I, Result<O>>,
    input?: I,
    output?: O
  ) =>
  (base: ReturnType<(typeof initTRPC)["create"]>["procedure"]) => {
    switch (true) {
      case typeof input !== `undefined` && typeof output !== `undefined`:
        return base
          .input(input!)
          .output(output!)
          [type](toProcedure<Result<O>, I>(fn));
      case typeof input !== `undefined` && typeof output === `undefined`:
        return base.input(input!)[type](toProcedure<Result<O>, I>(fn));
      case typeof input === `undefined` && typeof output !== `undefined`:
        return base.output(output!)[type](toProcedure<Result<O>, I>(fn));
      default:
        return base[type](toProcedure<Result<O>, I>(fn));
    }
  };
