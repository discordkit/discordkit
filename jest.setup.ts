import { setupServer } from "msw/node";
import { rest } from "msw";
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

export const mockGet = <S extends z.ZodTypeAny>(
  path: string,
  schema: S
): z.infer<S> => {
  const result = generateMock(schema);
  msw.use(
    rest.get(`${endpoint}${path}`, async (_, res, ctx) => res(ctx.json(result)))
  );

  return result;
};

export const mockPut = <S extends z.ZodTypeAny>(
  path: string,
  schema?: S
): z.infer<S> => {
  const result = schema ? generateMock(schema) : null;
  msw.use(
    rest.put(`${endpoint}${path}`, async (_, res, ctx) => res(ctx.json(result)))
  );

  return result;
};
