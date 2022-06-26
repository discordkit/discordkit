import { z } from "zod";
import { get, query } from "../utils";
import type { WelcomeScreen } from "./types";

export const getGuildWelcomeScreenSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns the Welcome Screen object for the guild. If the welcome screen is not enabled, the `MANAGE_GUILD` permission is required.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen
 */
export const getGuildWelcomeScreen = query(getGuildWelcomeScreenSchema, ({ guild }) =>
  get<WelcomeScreen>(`/guilds/${guild}/welcome-screen`)
);
