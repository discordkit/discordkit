import { initTRPC } from "@trpc/server";
import {
  createGuildEmojiProcedure,
  deleteGuildEmojiProcedure,
  getGuildEmojiProcedure,
  listGuildEmojisProcedure,
  modifyGuildEmojiProcedure
} from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  createGuildEmoji: createGuildEmojiProcedure(tRPC.procedure),
  deleteGuildEmoji: deleteGuildEmojiProcedure(tRPC.procedure),
  getGuildEmoji: getGuildEmojiProcedure(tRPC.procedure),
  listGuildEmojis: listGuildEmojisProcedure(tRPC.procedure),
  modifyGuildEmoji: modifyGuildEmojiProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
