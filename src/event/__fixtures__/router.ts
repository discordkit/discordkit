import { initTRPC } from "@trpc/server";
import {
  createGuildScheduledEventProcedure,
  deleteGuildScheduledEventProcedure,
  getGuildScheduledEventProcedure,
  getGuildScheduledEventUsersProcedure,
  listScheduledEventsForGuildProcedure,
  modifyGuildScheduledEventProcedure
} from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  createGuildScheduledEvent: createGuildScheduledEventProcedure(tRPC.procedure),
  deleteGuildScheduledEvent: deleteGuildScheduledEventProcedure(tRPC.procedure),
  getGuildScheduledEvent: getGuildScheduledEventProcedure(tRPC.procedure),
  getGuildScheduledEventUsers: getGuildScheduledEventUsersProcedure(
    tRPC.procedure
  ),
  listScheduledEventsForGuild: listScheduledEventsForGuildProcedure(
    tRPC.procedure
  ),
  modifyGuildScheduledEvent: modifyGuildScheduledEventProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
