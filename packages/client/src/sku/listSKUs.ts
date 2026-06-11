import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { SKU } from "./types/SKU.js";

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
 *
 * ```json
 * [
 *   {
 *     "id": "1088510053843210999",
 *     "type": 6,
 *     "dependent_sku_id": null,
 *     "application_id": "788708323867885999",
 *     "manifest_labels": null,
 *     "access_type": 1,
 *     "name": "Test Premium",
 *     "features": [],
 *     "release_date": null,
 *     "premium": false,
 *     "slug": "test-premium",
 *     "flags": 128,
 *     "show_age_gate": false
 *   },
 *   {
 *     "id": "1088510058284990888",
 *     "type": 5,
 *     "dependent_sku_id": null,
 *     "application_id": "788708323867885999",
 *     "manifest_labels": null,
 *     "access_type": 1,
 *     "name": "Test Premium",
 *     "features": [],
 *     "release_date": null,
 *     "premium": false,
 *     "slug": "test-premium",
 *     "flags": 128,
 *     "show_age_gate": false
 *   }
 * ]
 * ```
 */
export const listSKUs: Fetcher<typeof listSKUsSchema, SKU[]> = async ({
  application
}) => get(`/applications/${application}/skus`);
