import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteTestEntitlementSchema = v.object({
  application: snowflake,
  entitlement: snowflake
});

/**
 * ### [Delete Test Entitlement](https://discord.com/developers/docs/resources/entitlement#delete-test-entitlement)
 *
 * **DELETE** `/applications/:application/entitlements/:entitlement`
 *
 * Deletes a currently-active test entitlement. Discord will act as though that user or guild no longer has entitlement to your premium offering.
 *
 * Returns `204 No Content` on success.
 */
export const deleteTestEntitlement: Fetcher<
  typeof deleteTestEntitlementSchema
> = async ({ application, entitlement }) =>
  remove(`/applications/${application}/entitlements/${entitlement}`);

export const deleteTestEntitlementSafe = toValidated(
  deleteTestEntitlement,
  deleteTestEntitlementSchema
);

export const deleteTestEntitlementProcedure = toProcedure(
  `mutation`,
  deleteTestEntitlement,
  deleteTestEntitlementSchema
);
