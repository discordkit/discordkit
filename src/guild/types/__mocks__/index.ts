import { rest } from "msw";
import { generateMock } from "@anatine/zod-mock";
import { endpoint } from "../../../DiscordSession";
import { activity } from "../Activity";
import { guild } from "../Guild";

export const mockActivity = generateMock(activity);

export const mockGuild = generateMock(guild);
export const getGuildMock = rest.get(
  `${endpoint}/guilds/:id`,
  async (_, res, ctx) => res(ctx.json(mockGuild))
);
