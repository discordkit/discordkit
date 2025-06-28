import {
  type InferOutput,
  nullish,
  object,
  url,
  string,
  partial,
  pipe,
  nullable,
  exactOptional,
  nonEmpty
} from "valibot";
import { snowflake } from "@discordkit/core";
import { partialChannelSchema } from "../../channel/types/Channel.js";
import { guildSchema } from "../../guild/types/Guild.js";
import { userSchema } from "../../user/types/User.js";
import { webhookTypeSchema } from "./WebhookType.js";

export const webhookSchema = object({
  /** the id of the webhook */
  id: snowflake,
  /** the type of the webhook */
  type: webhookTypeSchema,
  /** the guild id this webhook is for, if any */
  guildId: nullish(snowflake),
  /** the channel id this webhook is for, if any */
  channelId: nullable(snowflake),
  /** user object	the user this webhook was created by (not returned when getting a webhook with its token) */
  user: exactOptional(userSchema),
  /** the default name of the webhook */
  name: nullable(pipe(string(), nonEmpty())),
  /** the default user avatar hash of the webhook */
  avatar: nullable(pipe(string(), nonEmpty())),
  /** the secure token of the webhook (returned for Incoming Webhooks) */
  token: exactOptional(pipe(string(), nonEmpty())),
  /** the bot/OAuth2 application that created this webhook */
  applicationId: nullable(snowflake),
  /** the guild of the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceGuild: exactOptional(partial(guildSchema)),
  /** the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceChannel: exactOptional(partialChannelSchema),
  /** the url used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url: exactOptional(pipe(string(), url()))
});

export type Webhook = InferOutput<typeof webhookSchema>;
