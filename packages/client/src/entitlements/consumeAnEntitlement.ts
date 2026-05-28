import * as v from "valibot";
import { post, type Fetcher, snowflake } from "@discordkit/core";

export const consumeAnEntitlementSchema = v.object({
  application: snowflake,
  entitlement: snowflake
});

/**
 * ### [Consume an Entitlement](https://discord.com/developers/docs/resources/entitlement#consume-an-entitlement)
 *
 * **POST** `/applications/:application/entitlements/:entitlement/consume`
 *
 * For One-Time Purchase consumable SKUs, marks a given entitlement for the user as consumed. The entitlement will have `consumed: true` when using List Entitlements.
 *
 * Returns a `204 No Content` on success.
 */
export const consumeAnEntitlement: Fetcher<
  typeof consumeAnEntitlementSchema
> = async ({ application, entitlement }) =>
  post(`/applications/${application}/entitlements/${entitlement}/consume`);
