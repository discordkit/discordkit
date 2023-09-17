import { z } from "zod";
import { channel } from "../../channel";
import { guild } from "../../guild";
import { user } from "../../user";
import { webhookType } from "./WebhookType";

export const webhook = z.object({
  /** the id of the webhook */
  id: z.string(),
  /** the type of the webhook */
  type: webhookType,
  /** the guild id this webhook is for, if any */
  guildId: z.string().optional(),
  /** the channel id this webhook is for, if any */
  channelId: z.string(),
  /** user object	the user this webhook was created by (not returned when getting a webhook with its token) */
  user: user.optional(),
  /** the default name of the webhook */
  name: z.string().optional(),
  /** the default user avatar hash of the webhook */
  avatar: z.string().optional(),
  /** the secure token of the webhook (returned for Incoming Webhooks) */
  token: z.string().optional(),
  /** the bot/OAuth2 application that created this webhook */
  applicationId: z.string().optional(),
  /** the guild of the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceGuild: guild.partial().optional(),
  /** the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceChannel: channel.partial().optional(),
  /** the url used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url: z.string().optional()
});

export type Webhook = z.infer<typeof webhook>;
