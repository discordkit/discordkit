import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { channelSchema } from "../../channel/types/Channel.ts";
import { guildSchema } from "../../guild/types/Guild.ts";
import { userSchema } from "../../user/types/User.ts";
import { webhookTypeSchema } from "./WebhookType.ts";

export const webhookSchema = z.object({
  /** the id of the webhook */
  id: snowflake,
  /** the type of the webhook */
  type: webhookTypeSchema,
  /** the guild id this webhook is for, if any */
  guildId: snowflake.nullish(),
  /** the channel id this webhook is for, if any */
  channelId: snowflake.optional(),
  /** user object	the user this webhook was created by (not returned when getting a webhook with its token) */
  user: userSchema.nullish(),
  /** the default name of the webhook */
  name: z.string().optional(),
  /** the default user avatar hash of the webhook */
  avatar: z.string().optional(),
  /** the secure token of the webhook (returned for Incoming Webhooks) */
  token: z.string().nullish(),
  /** the bot/OAuth2 application that created this webhook */
  applicationId: snowflake.optional(),
  /** the guild of the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceGuild: guildSchema.partial().nullish(),
  /** the channel that this webhook is following (returned for Channel Follower Webhooks) */
  sourceChannel: channelSchema.partial().nullish(),
  /** the url used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url: z.string().nullish()
});

export type Webhook = z.infer<typeof webhookSchema>;
