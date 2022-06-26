import type { Channel } from "../channel";
import type { Guild } from "../guild";
import type { User } from "../user";

export interface Webhook {
  /** the id of the webhook */
  id: string;
  /** the type of the webhook */
  type: WebhookType;
  /** the guild id this webhook is for, if any */
  guildId?: string;
  /** the channel id this webhook is for, if any */
  channelId: string;
  /** user object	the user this webhook was created by (not returned when getting a webhook with its token) */
  user?: User;
  /** the default name of the webhook */
  name?: string;
  /** the default user avatar hash of the webhook */
  avatar?: string;
  /** the secure token of the webhook (returned for Incoming Webhooks) */
  token?: string;
  /** the bot/OAuth2 application that created this webhook */
  applicationId?: string;
  /** the guild of the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceGuild?: Partial<Guild>;
  /** the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceChannel?: Partial<Channel>;
  /** the url used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url?: string;
}

export enum WebhookType {
  /** Incoming Webhooks can post messages to channels with a generated token */
  INCOMING = 1,
  /** Channel Follower Webhooks are internal webhooks used with Channel Following to post new messages into channels */
  CHANNEL_FOLLOWER = 2,
  /** Application webhooks are webhooks used with Interactions */
  APPLICATION = 3
}
