import "cross-fetch/polyfill";
import { discord } from "../src/DiscordSession";
import { msw } from "./test-utils";

beforeAll(() => {
  discord.setToken = `super-secret-token`;
  msw.listen();
});

afterEach(() => {
  msw.resetHandlers();
});

afterAll(() => {
  msw.close();
});
