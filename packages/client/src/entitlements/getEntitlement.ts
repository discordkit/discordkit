import { object } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { type Entitlement, entitlementSchema } from "./types/Entitlement.js";

export const getEntitlementSchema = object({
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

export const getEntitlementSafe = toValidated(
  getEntitlement,
  getEntitlementSchema,
  entitlementSchema
);

export const getEntitlementProcedure = toProcedure(
  `query`,
  getEntitlement,
  getEntitlementSchema,
  entitlementSchema
);

export const getEntitlementQuery = toQuery(getEntitlement);
