import { initTRPC } from "@trpc/server";
import {
  createGuildStickerProcedure,
  deleteGuildStickerProcedure,
  getGuildStickerProcedure,
  getStickerProcedure,
  listGuildStickersProcedure,
  listNitroStickerPacksProcedure,
  modifyGuildStickerProcedure
} from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  createGuildSticker: createGuildStickerProcedure(tRPC.procedure),
  deleteGuildSticker: deleteGuildStickerProcedure(tRPC.procedure),
  getGuildSticker: getGuildStickerProcedure(tRPC.procedure),
  getSticker: getStickerProcedure(tRPC.procedure),
  listGuildStickers: listGuildStickersProcedure(tRPC.procedure),
  listNitroStickerPacks: listNitroStickerPacksProcedure(tRPC.procedure),
  modifyGuildSticker: modifyGuildStickerProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
