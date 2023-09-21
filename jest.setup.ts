import { setupServer } from "msw/node";
import { rest } from "msw";
import type { GenerateMockOptions } from "@anatine/zod-mock";
import { generateMock } from "@anatine/zod-mock";
import type { z } from "zod";
import { endpoint, discord } from "./src/DiscordSession";

export const msw = setupServer();

beforeAll(() => {
  discord.setToken = `super-secret-token`;
  msw.listen();
});

afterEach(() => msw.resetHandlers());

afterAll(() => msw.close());

export const createMock =
  (type: `delete` | `get` | `patch` | `post` | `put` = `get`) =>
  <S extends z.ZodTypeAny>(
    path: string,
    responseSchema?: S,
    // eslint-disable-next-line no-undefined
    opts: GenerateMockOptions | undefined = undefined
  ): z.infer<S> => {
    const result = responseSchema ? generateMock(responseSchema, opts) : null;
    msw.use(
      rest[type](
        new URL(path.replace(/^\//, ``), endpoint).href,
        (_, res, ctx) => res(ctx.json(result))
      )
    );

    return result;
  };

export const mockRequest = {
  delete: createMock(`delete`),
  get: createMock(`get`),
  patch: createMock(`patch`),
  post: createMock(`post`),
  put: createMock(`put`)
};
