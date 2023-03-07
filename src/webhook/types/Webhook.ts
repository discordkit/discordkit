import type { Channel } from "../../channel";
import type { Guild } from "../../guild";
import type { User } from "../../user";
import type { WebhookType } from "./WebhookType";

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
