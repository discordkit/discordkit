import { beforeAll, afterAll } from "vitest";
// eslint-disable-next-line import/no-relative-packages
import { discord } from "../packages/core/src/DiscordSession";
import { msw } from "./test-utils";

beforeAll(() => {
  discord.setToken(`Bot super-secret-token`);
  msw.listen({ onUnhandledRequest: `error` });
});

afterAll(() => {
  msw.resetHandlers();
  msw.close();
});
