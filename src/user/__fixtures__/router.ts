import { initTRPC } from "@trpc/server";
import {
  createDMProcedure,
  createGroupDMProcedure,
  getCurrentUserProcedure,
  getCurrentUserGuildMemberProcedure,
  getCurrentUserGuildsProcedure,
  getUserProcedure,
  getUserConnectionsProcedure,
  leaveGuildProcedure,
  modifyCurrentUserProcedure
} from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  createDM: createDMProcedure(tRPC.procedure),
  createGroupDM: createGroupDMProcedure(tRPC.procedure),
  getCurrentUser: getCurrentUserProcedure(tRPC.procedure),
  getCurrentUserGuildMember: getCurrentUserGuildMemberProcedure(tRPC.procedure),
  getCurrentUserGuilds: getCurrentUserGuildsProcedure(tRPC.procedure),
  getUser: getUserProcedure(tRPC.procedure),
  getUserConnections: getUserConnectionsProcedure(tRPC.procedure),
  leaveGuild: leaveGuildProcedure(tRPC.procedure),
  modifyCurrentUser: modifyCurrentUserProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
