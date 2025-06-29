import { exactOptional, object, partial, picklist } from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const createTestEntitlementSchema = object({
  application: snowflake,
  params: exactOptional(
    partial(
      object({
        /** ID of the SKU to grant the entitlement to */
        skuId: snowflake,
        /** ID of the guild or user to grant the entitlement to */
        ownerId: snowflake,
        /** `1` for a guild subscription, `2` for a user subscription */
        ownerType: picklist([1, 2])
      })
    )
  )
});

/**
 * ### [Create Test Entitlement](https://discord.com/developers/docs/resources/entitlement#create-test-entitlement)
 *
 * **POST** `/applications/:application/entitlements`
 *
 * Creates a test entitlement to a given SKU for a given guild or user. Discord will act as though that user or guild has entitlement to your premium offering.
 *
 * This endpoint returns a partial entitlement object. It will **not** contain `subscription_id`, `starts_at`, or `ends_at`, as it's valid in perpetuity.
 *
 * After creating a test entitlement, you'll need to reload your Discord client. After doing so, you'll see that your server or user now has premium access.
 */
export const createTestEntitlement: Fetcher<
  typeof createTestEntitlementSchema
> = async ({ application, params }) =>
  post(`/applications/${application}/entitlements`, params);

export const createTestEntitlementSafe = toValidated(
  createTestEntitlement,
  createTestEntitlementSchema
);

export const createTestEntitlementProcedure = toProcedure(
  `mutation`,
  createTestEntitlement,
  createTestEntitlementSchema
);
