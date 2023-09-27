import { z } from "zod";
import { userSchema } from "../../user/types/User";
import { integrationApplicationSchema } from "./IntegrationApplication";
import { integrationAccountSchema } from "./IntegrationAccount";
import { integrationExpireBehaviorSchema } from "./IntegrationExpireBehavior";
import { scopesSchema } from "../../application";

export const integrationSchema = z.object({
  /** integration id */
  id: z.string().min(1),
  /** integration name */
  name: z.string().min(1),
  /** integration type (twitch, youtube, or discord) */
  type: z.string(),
  /** is this integration enabled */
  enabled: z.boolean(),
  /** is this integration syncing */
  syncing: z.boolean().nullable(),
  /** id that this integration uses for "subscribers" */
  roleId: z.string().min(1).nullable(),
  /** whether emoticons should be synced for this integration (twitch only currently) */
  enableEmoticons: z.boolean().nullable(),
  /** the behavior of expiring subscribers */
  expireBehavior: integrationExpireBehaviorSchema.nullable(),
  /** the grace period (in days) before expiring subscribers */
  expireGracePeriod: z.number().int().positive().nullable(),
  /** user for this integration */
  user: userSchema.nullable(),
  /** integration account information */
  account: integrationAccountSchema,
  /** when this integration was last synced */
  syncedAt: z.string().datetime().nullable(),
  /** how many subscribers this integration has */
  subscriberCount: z.number().int().positive().nullable(),
  /** has this integration been revoked */
  revoked: z.boolean().nullable(),
  /** The bot/OAuth2 application for discord integrations */
  application: integrationApplicationSchema.nullable(),
  /** the scopes the application has been authorized for */
  scopes: scopesSchema.array().nullable()
});

export type Integration = z.infer<typeof integrationSchema>;
