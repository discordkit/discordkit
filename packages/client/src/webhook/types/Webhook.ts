import * as v from "valibot";
import {
  partialSchema,
  schema,
  snowflake,
  boundedString,
  url
} from "@discordkit/core";
import { partialChannelSchema } from "../../channel/types/Channel.js";
import { guildSchema } from "../../guild/types/Guild.js";
import { userSchema } from "../../user/types/User.js";
import { WebhookType } from "./WebhookType.js";

const commonWebhookEntries = {
  /** the id of the webhook */
  id: snowflake,
  /** the default name of the webhook */
  name: v.nullable(boundedString()),
  /** the default user avatar hash of the webhook */
  avatar: v.nullable(boundedString())
} as const;

const _incomingWebhookSchema = v.object({
  ...commonWebhookEntries,
  /** the type of the webhook */
  type: v.literal(WebhookType.INCOMING),
  /** the guild id this webhook is for */
  guildId: v.nullish(snowflake),
  /** the channel id this webhook is for */
  channelId: snowflake,
  /** the user this webhook was created by (not returned when getting a webhook with its token) */
  user: v.exactOptional(userSchema),
  /** the secure token of the webhook (returned for Incoming Webhooks) */
  token: v.exactOptional(boundedString()),
  /** the url used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url: v.exactOptional(url),
  /** the bot/OAuth2 application that created this webhook */
  applicationId: v.nullable(snowflake)
});

export interface IncomingWebhook extends v.InferOutput<
  typeof _incomingWebhookSchema
> {}

/**
 * ### [Incoming Webhook](https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types)
 *
 * Incoming Webhooks can post messages to channels with a generated
 * token.
 */
export const incomingWebhookSchema = schema<IncomingWebhook>(
  _incomingWebhookSchema
);

const _channelFollowerWebhookSchema = v.object({
  ...commonWebhookEntries,
  /** the type of the webhook */
  type: v.literal(WebhookType.CHANNEL_FOLLOWER),
  /** the guild id this webhook is for */
  guildId: v.nullish(snowflake),
  /** the channel id this webhook is for */
  channelId: snowflake,
  /** the user this webhook was created by */
  user: v.exactOptional(userSchema),
  /** the guild of the channel that this webhook is following */
  sourceGuild: partialSchema(guildSchema),
  /** the channel that this webhook is following */
  sourceChannel: partialChannelSchema,
  /** the bot/OAuth2 application that created this webhook */
  applicationId: v.nullable(snowflake)
});

export interface ChannelFollowerWebhook extends v.InferOutput<
  typeof _channelFollowerWebhookSchema
> {}

/**
 * ### [Channel Follower Webhook](https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types)
 *
 * Internal webhooks used with Channel Following to post new messages
 * into channels.
 */
export const channelFollowerWebhookSchema = schema<ChannelFollowerWebhook>(
  _channelFollowerWebhookSchema
);

const _applicationWebhookSchema = v.object({
  ...commonWebhookEntries,
  /** the type of the webhook */
  type: v.literal(WebhookType.APPLICATION),
  /** application webhooks have no guild */
  guildId: v.null_(),
  /** application webhooks have no channel */
  channelId: v.null_(),
  /** the bot/OAuth2 application that created this webhook */
  applicationId: snowflake
});

export interface ApplicationWebhook extends v.InferOutput<
  typeof _applicationWebhookSchema
> {}

/**
 * ### [Application Webhook](https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types)
 *
 * Webhooks used with Interactions.
 */
export const applicationWebhookSchema = schema<ApplicationWebhook>(
  _applicationWebhookSchema
);

export type Webhook =
  | IncomingWebhook
  | ChannelFollowerWebhook
  | ApplicationWebhook;

/**
 * ### [Webhook](https://discord.com/developers/docs/resources/webhook#webhook-object)
 *
 * Used to represent a webhook. Discriminated by `type`:
 * {@link IncomingWebhook}, {@link ChannelFollowerWebhook}, or
 * {@link ApplicationWebhook}.
 */
export const webhookSchema = v.variant(`type`, [
  _incomingWebhookSchema,
  _channelFollowerWebhookSchema,
  _applicationWebhookSchema
]) as v.GenericSchema<Webhook>;
