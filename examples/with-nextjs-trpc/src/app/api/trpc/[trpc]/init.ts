import { initTRPC } from "@trpc/server";
import { cache } from "react";

export const createContext = cache(() => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return {};
});

const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
