import * as v from "valibot";
import { snowflake, boundedString, url } from "@discordkit/core";
import { partialChannelSchema } from "../../channel/types/Channel.js";
import { guildSchema } from "../../guild/types/Guild.js";
import { userSchema } from "../../user/types/User.js";
import { webhookTypeSchema } from "./WebhookType.js";

export const webhookSchema = v.object({
  /** the id of the webhook */
  id: snowflake,
  /** the type of the webhook */
  type: webhookTypeSchema,
  /** the guild id this webhook is for, if any */
  guildId: v.nullish(snowflake),
  /** the channel id this webhook is for, if any */
  channelId: v.nullable(snowflake),
  /** user object	the user this webhook was created by (not returned when getting a webhook with its token) */
  user: v.exactOptional(userSchema),
  /** the default name of the webhook */
  name: v.nullable(boundedString()),
  /** the default user avatar hash of the webhook */
  avatar: v.nullable(boundedString()),
  /** the secure token of the webhook (returned for Incoming Webhooks) */
  token: v.exactOptional(boundedString()),
  /** the bot/OAuth2 application that created this webhook */
  applicationId: v.nullable(snowflake),
  /** the guild of the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceGuild: v.exactOptional(v.partial(guildSchema)),
  /** the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceChannel: v.exactOptional(partialChannelSchema),
  /** the url used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url: v.exactOptional(url)
});

export interface Webhook extends v.InferOutput<typeof webhookSchema> {}
