import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type GuildOnboarding } from "./types/GuildOnboarding.js";

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
