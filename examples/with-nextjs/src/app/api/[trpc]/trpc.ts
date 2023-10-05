import { initTRPC } from "@trpc/server";
import { discord, getCurrentApplicationProcedure } from "@discordkit/client";

const botToken = process.env.DISCORD_BOT_AUTH_TOKEN;

if (botToken) {
  discord.setToken(`Bot ${botToken}`);
} else {
  throw new Error(`Bot token must be set in your ./env.local file!`);
}

const t = initTRPC.create();
const baseProcedure = t.procedure;

export const appRouter = t.router({
  getCurrentApplication: getCurrentApplicationProcedure(baseProcedure)
});

export type AppRouter = typeof appRouter;
