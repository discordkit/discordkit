import { initTRPC, TRPCError } from "@trpc/server";
import { toProcedure } from "@discordkit/core";
import {
  applicationSchema,
  discord,
  getCurrentApplication
} from "@discordkit/client";
import { summarize, ValiError } from "valibot";

const token = process.env.BOT_TOKEN;
discord.setToken(`Bot ${token}`);

const t = initTRPC.create();
const baseProcedure = t.procedure;

const loggedProcedure = baseProcedure.use(async (opts) => {
  const result = await opts.next();

  if (!result.ok) {
    // @ts-expect-error
    console.error(summarize(result.error.cause.issues));
  }

  return result;
});

const getCurrentApplicationProcedure = toProcedure(
  `query`,
  getCurrentApplication,
  null,
  applicationSchema
);

export const router = t.router({
  getCurrentApplication: getCurrentApplicationProcedure(
    // @ts-expect-error — @trpc/server bundles two copies of AnyProcedureBuilder
    // from differently-hashed declaration files, so the structurally-identical
    // types don't unify. Safe at runtime.
    loggedProcedure,
    (cause) => {
      throw new TRPCError({
        code: `INTERNAL_SERVER_ERROR`,
        message:
          cause instanceof ValiError
            ? summarize(cause.issues)
            : `Failed to run procedure "getCurrentApplication"`,
        cause
      });
    }
  )
});

export type Router = typeof router;
