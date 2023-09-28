import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import {
  welcomeScreenSchema,
  type WelcomeScreen
} from "./types/WelcomeScreen.ts";

export const getGuildWelcomeScreenSchema = z.object({
  guild: z.string().min(1)
});

/**
 * ### [Get Guild Welcome Screen](https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen)
 * **GET** `/guilds/:guild/welcome-screen`
 *
 * Returns the {@link WelcomeScreen | Welcome Screen object} for the guild. If the welcome screen is not enabled, the `MANAGE_GUILD` permission is required.
 */
export const getGuildWelcomeScreen: Fetcher<
  typeof getGuildWelcomeScreenSchema,
  WelcomeScreen
> = async ({ guild }) => get(`/guilds/${guild}/welcome-screen`);

export const getGuildWelcomeScreenProcedure = toProcedure(
  `query`,
  getGuildWelcomeScreen,
  getGuildWelcomeScreenSchema,
  welcomeScreenSchema
);

export const getGuildWelcomeScreenQuery = toQuery(getGuildWelcomeScreen);
