import { z } from "zod";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated
} from "@discordkit/core";

export const deleteGuildIntegrationSchema = z.object({
  guild: z.string().min(1),
  integration: z.string().min(1)
});

/**
 * ### [Delete Guild Integration](https://discord.com/developers/docs/resources/guild#delete-guild-integration)
 *
 * **DELETE** `/guilds/:guild/integrations/:integration`
 *
 * Delete the attached integration object for the guild. Deletes any associated webhooks and kicks the associated bot if there is one. Requires the `MANAGE_GUILD` permission. Returns a `204 empty` response on success. Fires Guild Integrations Update and Integration Delete Gateway events.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteGuildIntegration: Fetcher<
  typeof deleteGuildIntegrationSchema
> = async ({ guild, integration }) =>
  remove(`/guilds/${guild}/integrations/${integration}`);

export const deleteGuildIntegrationSafe = toValidated(
  deleteGuildIntegration,
  deleteGuildIntegrationSchema
);

export const deleteGuildIntegrationProcedure = toProcedure(
  `mutation`,
  deleteGuildIntegration,
  deleteGuildIntegrationSchema
);
