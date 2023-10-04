import { beforeAll, afterAll } from "vitest";
import { discord } from "@discordkit/core";
import { msw } from "./test-utils.js";

beforeAll(() => {
  discord.setToken(`Bot super-secret-token`);
  msw.listen({ onUnhandledRequest: `error` });
});

afterAll(() => {
  msw.resetHandlers();
  msw.close();
});
