import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { dispatchEvent } from "../dispatch.js";

const _integrationDeleteSchema = v.object({
  /** Integration ID */
  id: snowflake,
  /** ID of the guild */
  guildId: snowflake,
  /** ID of the bot/OAuth2 application for this discord integration */
  applicationId: v.optional(snowflake)
});

export interface IntegrationDelete extends v.InferOutput<
  typeof _integrationDeleteSchema
> {}

/**
 * ### [Integration Delete](https://discord.com/developers/docs/events/gateway-events#integration-delete)
 */
export const integrationDeleteSchema = schema<IntegrationDelete>(
  _integrationDeleteSchema
);

/**
 * ### [Integration Delete](https://discord.com/developers/docs/events/gateway-events#integration-delete)
 *
 * Sent when an integration is deleted. Unlike create/update this is ids only —
 * the integration object is gone.
 *
 * Gated by `GUILD_INTEGRATIONS`.
 */
export const onIntegrationDelete = dispatchEvent<
  IntegrationDelete,
  `INTEGRATION_DELETE`
>(`INTEGRATION_DELETE`);
