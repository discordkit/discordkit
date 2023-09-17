import { initTRPC } from "@trpc/server";
import { setupServer } from "msw/node";
import { getGuild, getGuildSchema, guild } from "../guild";
import { getGuildMock, mockGuild } from "../guild/types/__mocks__";
import { discord } from "../DiscordSession";

const server = setupServer(getGuildMock);

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  getGuild: publicProcedure.input(getGuildSchema).output(guild).query(getGuild)
});
const caller = appRouter.createCaller({});

describe(`smoke test`, () => {
  beforeAll(() => {
    discord.setToken = `foo`;
    server.listen();
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it(`works as expected`, async () => {
    const actual = await caller.getGuild({
      id: `foo`
    });

    expect(actual).toStrictEqual(mockGuild);
  });
});
