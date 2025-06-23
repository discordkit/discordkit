import {
  object,
  string,
  boolean,
  nullish,
  type InferOutput,
  minValue,
  integer,
  number,
  array,
  isoTimestamp,
  pipe,
  nonEmpty
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { scopesSchema } from "../../application/types/Scopes.js";
import { integrationApplicationSchema } from "./IntegrationApplication.js";
import { integrationAccountSchema } from "./IntegrationAccount.js";
import { integrationExpireBehaviorSchema } from "./IntegrationExpireBehavior.js";

export const integrationSchema = object({
  /** integration id */
  id: snowflake,
  /** integration name */
  name: pipe(string(), nonEmpty()),
  /** integration type (twitch, youtube, or discord) */
  type: string(),
  /** is this integration enabled */
  enabled: boolean(),
  /** is this integration syncing */
  syncing: nullish(boolean()),
  /** id that this integration uses for "subscribers" */
  roleId: nullish(snowflake),
  /** whether emoticons should be synced for this integration (twitch only currently) */
  enableEmoticons: nullish(boolean()),
  /** the behavior of expiring subscribers */
  expireBehavior: nullish(integrationExpireBehaviorSchema),
  /** the grace period (in days) before expiring subscribers */
  expireGracePeriod: nullish(pipe(number(), integer(), minValue(0))),
  /** user for this integration */
  user: nullish(userSchema),
  /** integration account information */
  account: integrationAccountSchema,
  /** when this integration was last synced */
  syncedAt: nullish(pipe(string(), isoTimestamp())),
  /** how many subscribers this integration has */
  subscriberCount: nullish(pipe(number(), integer(), minValue(0))),
  /** has this integration been revoked */
  revoked: nullish(boolean()),
  /** The bot/OAuth2 application for discord integrations */
  application: nullish(integrationApplicationSchema),
  /** the scopes the application has been authorized for */
  scopes: nullish(array(scopesSchema))
});

export type Integration = InferOutput<typeof integrationSchema>;
