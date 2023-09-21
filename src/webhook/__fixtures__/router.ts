import { initTRPC } from "@trpc/server";
import {
  createWebhookProcedure,
  deleteWebhookProcedure,
  deleteWebhookMessageProcedure,
  deleteWebhookWithTokenProcedure,
  editWebhookMessageProcedure,
  executeGitHubCompatibleWebhookProcedure,
  executeSlackCompatibleWebhookProcedure,
  executeWebhookProcedure,
  getChannelWebhooksProcedure,
  getGuildWebhooksProcedure,
  getWebhookProcedure,
  getWebhookMessageProcedure,
  getWebhookWithTokenProcedure,
  modifyWebhookProcedure,
  modifyWebhookWithTokenProcedure
} from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  createWebhook: createWebhookProcedure(tRPC.procedure),
  deleteWebhook: deleteWebhookProcedure(tRPC.procedure),
  deleteWebhookMessage: deleteWebhookMessageProcedure(tRPC.procedure),
  deleteWebhookWithToken: deleteWebhookWithTokenProcedure(tRPC.procedure),
  editWebhookMessage: editWebhookMessageProcedure(tRPC.procedure),
  executeGitHubCompatibleWebhook: executeGitHubCompatibleWebhookProcedure(
    tRPC.procedure
  ),
  executeSlackCompatibleWebhook: executeSlackCompatibleWebhookProcedure(
    tRPC.procedure
  ),
  executeWebhook: executeWebhookProcedure(tRPC.procedure),
  getChannelWebhooks: getChannelWebhooksProcedure(tRPC.procedure),
  getGuildWebhooks: getGuildWebhooksProcedure(tRPC.procedure),
  getWebhook: getWebhookProcedure(tRPC.procedure),
  getWebhookMessage: getWebhookMessageProcedure(tRPC.procedure),
  getWebhookWithToken: getWebhookWithTokenProcedure(tRPC.procedure),
  modifyWebhook: modifyWebhookProcedure(tRPC.procedure),
  modifyWebhookWithToken: modifyWebhookWithTokenProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
