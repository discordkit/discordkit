import { initTRPC } from "@trpc/server";
import {
  createGuildFromTemplateProcedure,
  createGuildTemplateProcedure,
  deleteGuildTemplateProcedure,
  getGuildTemplateProcedure,
  getGuildTemplatesProcedure,
  modifyGuildTemplateProcedure,
  syncGuildTemplateProcedure
} from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  createGuildFromTemplate: createGuildFromTemplateProcedure(tRPC.procedure),
  createGuildTemplate: createGuildTemplateProcedure(tRPC.procedure),
  deleteGuildTemplate: deleteGuildTemplateProcedure(tRPC.procedure),
  getGuildTemplate: getGuildTemplateProcedure(tRPC.procedure),
  getGuildTemplates: getGuildTemplatesProcedure(tRPC.procedure),
  modifyGuildTemplate: modifyGuildTemplateProcedure(tRPC.procedure),
  syncGuildTemplate: syncGuildTemplateProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
