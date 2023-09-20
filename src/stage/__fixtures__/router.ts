import { initTRPC } from "@trpc/server";
import {
  createStageInstanceProcedure,
  deleteStageInstanceProcedure,
  getStageInstanceProcedure,
  modifyStageInstanceProcedure
} from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  createStageInstance: createStageInstanceProcedure(tRPC.procedure),
  deleteStageInstance: deleteStageInstanceProcedure(tRPC.procedure),
  getStageInstance: getStageInstanceProcedure(tRPC.procedure),
  modifyStageInstance: modifyStageInstanceProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
