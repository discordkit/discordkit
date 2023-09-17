import { z } from "zod";
import { user } from "../../user";
import { integrationApplication } from "./IntegrationApplication";
import { integrationAccount } from "./IntegrationAccount";
import { integrationExpireBehavior } from "./IntegrationExpireBehavior";

export const integration = z.object({
  /** integration id */
  id: z.string(),
  /** integration name */
  name: z.string(),
  /** integration type (twitch, youtube, or discord) */
  type: z.string(),
  /** is this integration enabled */
  enabled: z.boolean().optional(),
  /** is this integration syncing */
  syncing: z.boolean().optional(),
  /** id that this integration uses for "subscribers" */
  roleId: z.string().optional(),
  /** whether emoticons should be synced for this integration (twitch only currently) */
  enableEmoticons: z.boolean().optional(),
  /** the behavior of expiring subscribers */
  expireBehavior: integrationExpireBehavior.optional(),
  /** the grace period (in days) before expiring subscribers */
  expireGracePeriod: z.number().optional(),
  /** user for this integration */
  user: user.optional(),
  /** integration account information */
  account: integrationAccount,
  /** when this integration was last synced */
  syncedAt: z.string().optional(),
  /** how many subscribers this integration has */
  subscriberCount: z.number().optional(),
  /** has this integration been revoked */
  revoked: z.boolean().optional(),
  /** The bot/OAuth2 application for discord integrations */
  application: integrationApplication.optional()
});

export type Integration = z.infer<typeof integration>;
