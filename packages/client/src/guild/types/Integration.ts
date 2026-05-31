import * as v from "valibot";
import {
  schema,
  snowflake,
  timestamp,
  boundedInteger,
  boundedString
} from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { scopesSchema } from "../../application/types/Scopes.js";
import { integrationApplicationSchema } from "./IntegrationApplication.js";
import { integrationAccountSchema } from "./IntegrationAccount.js";
import { integrationExpireBehaviorSchema } from "./IntegrationExpireBehavior.js";

const _integrationSchema = v.object({
  /** integration id */
  id: snowflake,
  /** integration name */
  name: boundedString(),
  /** integration type (twitch, youtube, discord, or guild_subscription) */
  type: v.string(),
  /** is this integration enabled */
  enabled: v.boolean(),
  /** is this integration syncing */
  syncing: v.exactOptional(v.boolean()),
  /** id that this integration uses for "subscribers" */
  roleId: v.exactOptional(snowflake),
  /** whether emoticons should be synced for this integration (twitch only currently) */
  enableEmoticons: v.exactOptional(v.boolean()),
  /** the behavior of expiring subscribers */
  expireBehavior: v.exactOptional(integrationExpireBehaviorSchema),
  /** the grace period (in days) before expiring subscribers */
  expireGracePeriod: v.exactOptional(boundedInteger()),
  /** user for this integration */
  user: v.exactOptional(userSchema),
  /** integration account information */
  account: integrationAccountSchema,
  /** when this integration was last synced */
  syncedAt: v.exactOptional(timestamp),
  /** how many subscribers this integration has */
  subscriberCount: v.exactOptional(boundedInteger()),
  /** has this integration been revoked */
  revoked: v.exactOptional(v.boolean()),
  /** The bot/OAuth2 application for discord integrations */
  application: v.exactOptional(integrationApplicationSchema),
  /** the scopes the application has been authorized for */
  scopes: v.exactOptional(v.array(scopesSchema))
});

export interface Integration extends v.InferOutput<typeof _integrationSchema> {}

/**
 * ### [Integration](https://discord.com/developers/docs/resources/guild#integration-object)
 */
export const integrationSchema = schema<Integration>(_integrationSchema);
