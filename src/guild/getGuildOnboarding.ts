import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { guildOnboardingSchema, type GuildOnboarding } from "./types";

export const getGuildOnboardingSchema = z.object({
  guild: z.string().min(1)
});

/**
 * ### [Get Guild Onboarding](https://discord.com/developers/docs/resources/guild#get-guild-onboarding)
 *
 * **GET** `/guilds/:guild/onboarding`
 *
 * Returns the Onboarding object for the guild.
 */
export const getGuildOnboarding: Fetcher<
  typeof getGuildOnboardingSchema,
  GuildOnboarding
> = async ({ guild }) => get(`/guilds/${guild}/onboarding`);

export const getGuildOnboardingProcedure = toProcedure(
  `query`,
  getGuildOnboarding,
  getGuildOnboardingSchema,
  guildOnboardingSchema
);

export const getGuildOnboardingQuery = toQuery(getGuildOnboarding);
