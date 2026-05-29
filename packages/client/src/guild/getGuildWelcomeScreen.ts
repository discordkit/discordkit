import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type WelcomeScreen } from "./types/WelcomeScreen.js";

export const getGuildWelcomeScreenSchema = v.object({
  guild: snowflake
});

/**
 * ### [Get Guild Welcome Screen](https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen)
 *
 * **GET** `/guilds/:guild/welcome-screen`
 *
 * Returns the {@link WelcomeScreen | Welcome Screen object} for the guild. If the welcome screen is not enabled, the `MANAGE_GUILD` permission is required.
 */
export const getGuildWelcomeScreen: Fetcher<
  typeof getGuildWelcomeScreenSchema,
  WelcomeScreen
> = async ({ guild }) => get(`/guilds/${guild}/welcome-screen`);
