import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { scopesSchema } from "../../application/types/Scopes.js";
import { integrationApplicationSchema } from "./IntegrationApplication.js";
import { integrationAccountSchema } from "./IntegrationAccount.js";
import { integrationExpireBehaviorSchema } from "./IntegrationExpireBehavior.js";

export const integrationSchema = z.object({
  /** integration id */
  id: snowflake,
  /** integration name */
  name: z.string().min(1),
  /** integration type (twitch, youtube, or discord) */
  type: z.string(),
  /** is this integration enabled */
  enabled: z.boolean(),
  /** is this integration syncing */
  syncing: z.boolean().nullish(),
  /** id that this integration uses for "subscribers" */
  roleId: snowflake.nullish(),
  /** whether emoticons should be synced for this integration (twitch only currently) */
  enableEmoticons: z.boolean().nullish(),
  /** the behavior of expiring subscribers */
  expireBehavior: integrationExpireBehaviorSchema.nullish(),
  /** the grace period (in days) before expiring subscribers */
  expireGracePeriod: z.number().int().positive().nullish(),
  /** user for this integration */
  user: userSchema.nullish(),
  /** integration account information */
  account: integrationAccountSchema,
  /** when this integration was last synced */
  syncedAt: z.string().datetime().nullish(),
  /** how many subscribers this integration has */
  subscriberCount: z.number().int().positive().nullish(),
  /** has this integration been revoked */
  revoked: z.boolean().nullish(),
  /** The bot/OAuth2 application for discord integrations */
  application: integrationApplicationSchema.nullish(),
  /** the scopes the application has been authorized for */
  scopes: scopesSchema.array().nullish()
});

export type Integration = z.infer<typeof integrationSchema>;
