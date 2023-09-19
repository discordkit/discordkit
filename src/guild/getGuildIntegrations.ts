import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { integrationSchema, type Integration } from "./types";

export const getGuildIntegrationsSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of integration objects for the guild. Requires the `MANAGE_GUILD` permission.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-integrations
 */
export const getGuildIntegrations: Fetcher<
  typeof getGuildIntegrationsSchema,
  Integration[]
> = async ({ guild }) => get(`/guilds/${guild}/integrations`);

export const getGuildIntegrationsProcedure = createProcedure(
  `query`,
  getGuildIntegrations,
  getGuildIntegrationsSchema,
  integrationSchema.array()
);
