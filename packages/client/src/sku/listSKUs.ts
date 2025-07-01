import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { skuSchema, type SKU } from "./types/SKU.js";

export const listSKUsSchema = v.object({
  application: snowflake
});

/**
 * ### [List SKUs](https://discord.com/developers/docs/resources/sku#list-skus)
 *
 * **GET** `/applications/:application/skus`
 *
 * Returns all SKUs for a given application.
 *
 * > [!NOTE]
 * >
 * > Because of how our SKU and subscription systems work, you will see two SKUs for your subscription offering. For integration and testing entitlements for Subscriptions, you should use the SKU with `type: 5`.
 */
export const listSKUs: Fetcher<typeof listSKUsSchema, SKU[]> = async ({
  application
}) => get(`/applications/${application}/skus`);

export const listSKUsSafe = toValidated(
  listSKUs,
  listSKUsSchema,
  v.array(skuSchema)
);

export const listSKUsProcedure = toProcedure(
  `query`,
  listSKUs,
  listSKUsSchema,
  v.array(skuSchema)
);

export const listSKUsQuery = toQuery(listSKUs);
