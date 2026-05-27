import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type SKU } from "./types/SKU.js";

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
