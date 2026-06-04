import * as v from "valibot";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { timestamp } from "@discordkit/core/validations/timestamp";
import { userSchema } from "../../user/types/User.js";
import { scopesSchema } from "../../application/types/Scopes.js";
import { integrationApplicationSchema } from "./IntegrationApplication.js";
import { integrationAccountSchema } from "./IntegrationAccount.js";
import { integrationExpireBehaviorSchema } from "./IntegrationExpireBehavior.js";

const commonIntegrationEntries = {
  /** integration id */
  id: snowflake,
  /** integration name */
  name: boundedString(),
  /** is this integration enabled */
  enabled: v.boolean(),
  /** user for this integration */
  user: v.exactOptional(userSchema)
} as const;

const _subscriptionIntegrationSchema = v.object({
  ...commonIntegrationEntries,
  /** integration type (twitch, youtube, discord, or guild_subscription) */
  type: v.picklist([`twitch`, `youtube`, `guild_subscription`]),
  /** is this integration syncing */
  syncing: v.boolean(),
  /** id that this integration uses for "subscribers" */
  roleId: snowflake,
  /** whether emoticons should be synced for this integration (twitch only currently) */
  enableEmoticons: v.exactOptional(v.boolean()),
  /** the behavior of expiring subscribers */
  expireBehavior: integrationExpireBehaviorSchema,
  /** the grace period (in days) before expiring subscribers */
  expireGracePeriod: boundedInteger(),
  /** integration account information */
  account: integrationAccountSchema,
  /** when this integration was last synced */
  syncedAt: timestamp,
  /** how many subscribers this integration has */
  subscriberCount: boundedInteger(),
  /** has this integration been revoked */
  revoked: v.boolean(),
  /** the scopes the application has been authorized for */
  scopes: v.exactOptional(v.array(scopesSchema))
});

export interface SubscriptionIntegration extends v.InferOutput<
  typeof _subscriptionIntegrationSchema
> {}

/**
 * ### [Subscription Integration](https://discord.com/developers/docs/resources/guild#integration-object)
 *
 * Third-party subscription integrations (Twitch, YouTube, or guild
 * subscriptions). Carry subscriber and expire metadata.
 */
export const subscriptionIntegrationSchema = schema<SubscriptionIntegration>(
  _subscriptionIntegrationSchema
);

const _discordBotIntegrationSchema = v.object({
  ...commonIntegrationEntries,
  /** integration type (twitch, youtube, discord, or guild_subscription) */
  type: v.literal(`discord`),
  /** the bot/OAuth2 application for discord integrations */
  application: integrationApplicationSchema,
  /** the scopes the application has been authorized for */
  scopes: v.exactOptional(v.array(scopesSchema))
});

export interface DiscordBotIntegration extends v.InferOutput<
  typeof _discordBotIntegrationSchema
> {}

/**
 * ### [Discord Bot Integration](https://discord.com/developers/docs/resources/guild#integration-object)
 *
 * A bot application installed into a guild. Carries the
 * {@link IntegrationApplication} instead of the subscriber metadata.
 */
export const discordBotIntegrationSchema = schema<DiscordBotIntegration>(
  _discordBotIntegrationSchema
);

export type Integration = SubscriptionIntegration | DiscordBotIntegration;

/**
 * ### [Integration](https://discord.com/developers/docs/resources/guild#integration-object)
 *
 * Discriminated by `type`: {@link SubscriptionIntegration}
 * (`"twitch" | "youtube" | "guild_subscription"`) or
 * {@link DiscordBotIntegration} (`"discord"`).
 */
export const integrationSchema = v.variant(`type`, [
  _subscriptionIntegrationSchema,
  _discordBotIntegrationSchema
]) as v.GenericSchema<Integration>;
