import * as v from "valibot";
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

export const listEntitlementsSchema = v.object({
  application: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** User ID to look up entitlements for */
        userId: snowflake,
        /** Optional list of SKU IDs to check entitlements for */
        skuIds: v.pipe(v.string(), v.nonEmpty()),
        /** Retrieve entitlements before this entitlement ID */
        before: snowflake,
        /** Retrieve entitlements after this entitlement ID */
        after: snowflake,
        /** Number of entitlements to return, 1-100, default 100 */
        limit: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
        /** Guild ID to look up entitlements for */
        guildId: snowflake,
        /** Whether or not ended entitlements should be omitted. Defaults to false, ended entitlements are included by default. */
        excludeEnded: v.boolean(),
        /** Whether or not deleted entitlements should be omitted. Defaults to true, deleted entitlements are not included by default. */
        excludeDeleted: v.boolean()
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
  v.array(entitlementSchema)
);

export const listEntitlementsProcedure = toProcedure(
  `query`,
  listEntitlements,
  listEntitlementsSchema,
  v.array(entitlementSchema)
);

export const listEntitlementsQuery = toQuery(listEntitlements);
