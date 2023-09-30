import "cross-fetch/polyfill";
import { discord } from "../src/DiscordSession";
import { msw } from "./test-utils";

beforeAll(() => {
  discord.setToken(`Bot super-secret-token`);
  msw.listen({ onUnhandledRequest: `error` });
});

afterAll(() => {
  msw.resetHandlers();
  msw.close();
});
