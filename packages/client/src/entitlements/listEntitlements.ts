import {
  object,
  array,
  exactOptional,
  partial,
  pipe,
  nonEmpty,
  string,
  number,
  integer,
  boolean,
  minValue,
  maxValue
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import type { Entitlement } from "./types/Entitlement.js";
import { entitlementSchema } from "./types/Entitlement.js";

export const listEntitlementsSchema = object({
  application: snowflake,
  params: exactOptional(
    partial(
      object({
        /** User ID to look up entitlements for */
        userId: snowflake,
        /** Optional list of SKU IDs to check entitlements for */
        skuIds: pipe(string(), nonEmpty()),
        /** Retrieve entitlements before this entitlement ID */
        before: snowflake,
        /** Retrieve entitlements after this entitlement ID */
        after: snowflake,
        /** Number of entitlements to return, 1-100, default 100 */
        limit: pipe(number(), integer(), minValue(1), maxValue(100)),
        /** Guild ID to look up entitlements for */
        guildId: snowflake,
        /** Whether or not ended entitlements should be omitted. Defaults to false, ended entitlements are included by default. */
        excludeEnded: boolean(),
        /** Whether or not deleted entitlements should be omitted. Defaults to true, deleted entitlements are not included by default. */
        excludeDeleted: boolean()
      })
    )
  )
});

/**
 * ### [List Entitlements](https://discord.com/developers/docs/resources/entitlement#list-entitlements)
 *
 * **GET** `/applications/:application/entitlements`
 *
 * Returns all entitlements for a given app, active and expired.
 */
export const listEntitlements: Fetcher<
  typeof listEntitlementsSchema,
  Entitlement[]
> = async ({ application, params }) =>
  get(`/applications/${application}/entitlements`, params);

export const listEntitlementsSafe = toValidated(
  listEntitlements,
  listEntitlementsSchema,
  array(entitlementSchema)
);

export const listEntitlementsProcedure = toProcedure(
  `query`,
  listEntitlements,
  listEntitlementsSchema,
  array(entitlementSchema)
);

export const listEntitlementsQuery = toQuery(listEntitlements);
