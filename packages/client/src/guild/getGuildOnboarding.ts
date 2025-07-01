import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  guildOnboardingSchema,
  type GuildOnboarding
} from "./types/GuildOnboarding.js";

export const getGuildOnboardingSchema = v.object({
  guild: snowflake
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

export const getGuildOnboardingSafe = toValidated(
  getGuildOnboarding,
  getGuildOnboardingSchema,
  guildOnboardingSchema
);

export const getGuildOnboardingProcedure = toProcedure(
  `query`,
  getGuildOnboarding,
  getGuildOnboardingSchema,
  guildOnboardingSchema
);

export const getGuildOnboardingQuery = toQuery(getGuildOnboarding);
