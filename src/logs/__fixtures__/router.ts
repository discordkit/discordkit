import { initTRPC } from "@trpc/server";
import { getGuildAuditLogProcedure } from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  getGuildAuditLog: getGuildAuditLogProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
