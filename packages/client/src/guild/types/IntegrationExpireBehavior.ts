import * as v from "valibot";

/**
 * ### [Integration Expire Behavior](https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors)
 */
export enum IntegrationExpireBehavior {
  REMOVE_ROLE = 0,
  KICK = 1
}

export const integrationExpireBehaviorSchema = v.enum_(
  IntegrationExpireBehavior
);
