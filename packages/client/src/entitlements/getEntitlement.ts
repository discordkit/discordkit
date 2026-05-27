import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type Entitlement } from "./types/Entitlement.js";

export const getEntitlementSchema = v.object({
  application: snowflake,
  entitlement: snowflake
});

/**
 * ### [Get Entitlement](https://discord.com/developers/docs/resources/entitlement#get-entitlement)
 *
 * **GET** `/applications/:application/entitlements/:entitlement`
 *
 * Returns an entitlement.
 */
export const getEntitlement: Fetcher<
  typeof getEntitlementSchema,
  Entitlement
> = async ({ application, entitlement }) =>
  get(`/applications/${application}/entitlements/${entitlement}`);
