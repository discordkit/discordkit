import { initTRPC } from "@trpc/server";
import { deleteInviteProcedure, getInviteProcedure } from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  deleteInvite: deleteInviteProcedure(tRPC.procedure),
  getInvite: getInviteProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
