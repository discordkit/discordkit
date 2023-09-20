import { initTRPC } from "@trpc/server";
import {
  createAutoModerationRuleProcedure,
  deleteAutoModerationRuleProcedure,
  getAutoModerationRuleProcedure,
  modifyAutoModerationRuleProcedure
} from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  createAutoModerationRule: createAutoModerationRuleProcedure(tRPC.procedure),
  deleteAutoModerationRule: deleteAutoModerationRuleProcedure(tRPC.procedure),
  getAutoModerationRule: getAutoModerationRuleProcedure(tRPC.procedure),
  modifyAutoModerationRule: modifyAutoModerationRuleProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
