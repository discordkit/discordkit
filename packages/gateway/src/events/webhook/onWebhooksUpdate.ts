import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { dispatchEvent } from "../dispatch.js";

const _webhooksUpdateSchema = v.object({
  /** ID of the guild */
  guildId: snowflake,
  /** ID of the channel */
  channelId: snowflake
});

export interface WebhooksUpdate extends v.InferOutput<
  typeof _webhooksUpdateSchema
> {}

/**
 * ### [Webhooks Update](https://discord.com/developers/docs/events/gateway-events#webhooks-update)
 */
export const webhooksUpdateSchema = schema<WebhooksUpdate>(
  _webhooksUpdateSchema
);

/**
 * ### [Webhooks Update](https://discord.com/developers/docs/events/gateway-events#webhooks-update)
 *
 * Sent when a guild channel's webhooks are created, updated, or deleted. Only
 * ids — it's a signal to re-fetch, not a payload.
 *
 * Gated by `GUILD_WEBHOOKS`.
 */
export const onWebhooksUpdate = dispatchEvent<
  WebhooksUpdate,
  `WEBHOOKS_UPDATE`
>(`WEBHOOKS_UPDATE`, [`GUILD_WEBHOOKS`]);
