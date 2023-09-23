import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";

export const deleteGuildIntegrationSchema = z.object({
  guild: z.string().min(1),
  integration: z.string().min(1)
});

/**
 * Delete the attached integration object for the guild. Deletes any associated webhooks and kicks the associated bot if there is one. Requires the `MANAGE_GUILD` permission. Returns a 204 empty response on success. Fires a [Guild Integrations Update](https://discord.com/developers/docs/topics/gateway#guild-integrations-update) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#delete-guild-integration
 */
export const deleteGuildIntegration: Fetcher<
  typeof deleteGuildIntegrationSchema
> = async ({ guild, integration }) =>
  remove(`/guilds/${guild}/integrations/${integration}`);

export const deleteGuildIntegrationProcedure = toProcedure(
  `mutation`,
  deleteGuildIntegration,
  deleteGuildIntegrationSchema
);
