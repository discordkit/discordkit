import {
  type InferOutput,
  nullish,
  object,
  optional,
  url,
  string,
  partial,
  pipe
} from "valibot";
import { snowflake } from "@discordkit/core";
import { channelSchema } from "../../channel/types/Channel.js";
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
  channelId: optional(snowflake),
  /** user object	the user this webhook was created by (not returned when getting a webhook with its token) */
  user: nullish(userSchema),
  /** the default name of the webhook */
  name: optional(string()),
  /** the default user avatar hash of the webhook */
  avatar: optional(string()),
  /** the secure token of the webhook (returned for Incoming Webhooks) */
  token: nullish(string()),
  /** the bot/OAuth2 application that created this webhook */
  applicationId: optional(snowflake),
  /** the guild of the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceGuild: nullish(partial(guildSchema)),
  /** the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceChannel: nullish(partial(channelSchema)),
  /** the url used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url: nullish(pipe(string(), url()))
});

export type Webhook = InferOutput<typeof webhookSchema>;
