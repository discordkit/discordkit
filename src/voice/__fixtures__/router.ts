import { initTRPC } from "@trpc/server";
import { listVoiceRegionsProcedure } from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  listVoiceRegions: listVoiceRegionsProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
