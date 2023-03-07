import type { User } from "../../user";
import type { IntegrationApplication } from "./IntegrationApplication";
import type { IntegrationAccount } from "./IntegrationAccount";
import type { IntegrationExpireBehavior } from "./IntegrationExpireBehavior";

export interface Integration {
  /** integration id */
  id: string;
  /** integration name */
  name: string;
  /** integration type (twitch, youtube, or discord) */
  type: string;
  /** is this integration enabled */
  enabled?: boolean;
  /** is this integration syncing */
  syncing?: boolean;
  /** id that this integration uses for "subscribers" */
  roleId?: string;
  /** whether emoticons should be synced for this integration (twitch only currently) */
  enableEmoticons?: boolean;
  /** the behavior of expiring subscribers */
  expireBehavior?: IntegrationExpireBehavior;
  /** the grace period (in days) before expiring subscribers */
  expireGracePeriod?: number;
  /** user for this integration */
  user?: User;
  /** integration account information */
  account: IntegrationAccount;
  /** when this integration was last synced */
  syncedAt?: string;
  /** how many subscribers this integration has */
  subscriberCount?: number;
  /** has this integration been revoked */
  revoked?: boolean;
  /** The bot/OAuth2 application for discord integrations */
  application?: IntegrationApplication;
}
