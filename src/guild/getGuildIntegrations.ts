import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "#/utils/index.ts";
import { integrationSchema, type Integration } from "./types/Integration.ts";

export const getGuildIntegrationsSchema = z.object({
  guild: z.string().min(1)
});

/**
 * ### [Get Guild Integrations](https://discord.com/developers/docs/resources/guild#get-guild-integrations)
 *
 * **GET** `/guilds/:guild/integrations`
 *
 * Returns a list of {@link Integration | integration objects} for the guild. Requires the `MANAGE_GUILD` permission.
 *
 * > **NOTE**
 * >
 * > This endpoint returns a maximum of 50 integrations. If a guild has more integrations, they cannot be accessed.
 */
export const getGuildIntegrations: Fetcher<
  typeof getGuildIntegrationsSchema,
  Integration[]
> = async ({ guild }) => get(`/guilds/${guild}/integrations`);

export const getGuildIntegrationsSafe = toValidated(
  getGuildIntegrations,
  getGuildIntegrationsSchema,
  integrationSchema.array()
);

export const getGuildIntegrationsProcedure = toProcedure(
  `query`,
  getGuildIntegrations,
  getGuildIntegrationsSchema,
  integrationSchema.array()
);

export const getGuildIntegrationsQuery = toQuery(getGuildIntegrations);
