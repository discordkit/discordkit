import * as v from "valibot";
import {
  snowflake,
  timestamp,
  boundedInteger,
  boundedString
} from "@discordkit/core";
import { type User, userSchema } from "../../user/types/User.js";
import { scopesSchema } from "../../application/types/Scopes.js";
import { integrationApplicationSchema } from "./IntegrationApplication.js";
import { integrationAccountSchema } from "./IntegrationAccount.js";
import { integrationExpireBehaviorSchema } from "./IntegrationExpireBehavior.js";

export const integrationSchema = v.object({
  /** integration id */
  id: snowflake,
  /** integration name */
  name: boundedString(),
  /** integration type (twitch, youtube, or discord) */
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
  user: v.exactOptional<v.GenericSchema<User>>(userSchema),
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

export interface Integration extends v.InferOutput<typeof integrationSchema> {}
