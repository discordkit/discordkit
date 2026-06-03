import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteGuildIntegrationSchema = v.object({
  guild: snowflake,
  integration: snowflake
});

/**
 * ### [Delete Guild Integration](https://discord.com/developers/docs/resources/guild#delete-guild-integration)
 *
 * **DELETE** `/guilds/:guild/integrations/:integration`
 *
 * Delete the attached integration object for the guild. Deletes any associated webhooks and kicks the associated bot if there is one. Requires the `MANAGE_GUILD` permission. Returns a 204 empty response on success. Fires Guild Integrations Update and Integration Delete Gateway events.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteGuildIntegration: Fetcher<
  typeof deleteGuildIntegrationSchema,
  void,
  { auditLogReason: true }
> = async ({ guild, integration }, options) =>
  remove(`/guilds/${guild}/integrations/${integration}`, options);
