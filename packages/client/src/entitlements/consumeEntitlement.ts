import { object } from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const consumeEntitlementSchema = object({
  application: snowflake,
  entitlement: snowflake
});

/**
 * ### [Consume Entitlement](https://discord.com/developers/docs/resources/entitlement#consume-an-entitlement)
 *
 * **POST** `/applications/:application/entitlements/:entitlement/consume`
 *
 * For One-Time Purchase consumable SKUs, marks a given entitlement for the user as consumed. The entitlement will have `consumed: true` when using List Entitlements.
 *
 * Returns a `204 No Content` on success.
 */
export const consumeEntitlement: Fetcher<
  typeof consumeEntitlementSchema
> = async ({ application, entitlement }) =>
  post(`/applications/${application}/entitlements/${entitlement}/consume`);

export const consumeEntitlementSafe = toValidated(
  consumeEntitlement,
  consumeEntitlementSchema
);

export const consumeEntitlementProcedure = toProcedure(
  `mutation`,
  consumeEntitlement,
  consumeEntitlementSchema
);
