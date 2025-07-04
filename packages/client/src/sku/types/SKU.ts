import * as v from "valibot";
import { asInteger, snowflake, boundedString, url } from "@discordkit/core";
import { skuTypesSchema } from "./SKUTypes.js";
import { skuFlag } from "./SKUFlags.js";

/** SKUs (stock-keeping units) in Discord represent premium offerings that can be made available to your application's users or guilds. */
export const skuSchema = v.object({
  /** ID of SKU */
  id: snowflake,
  /** Type of SKU */
  type: skuTypesSchema,
  /** ID of the parent application */
  applicationId: snowflake,
  /** Customer-facing name of your premium offering */
  name: boundedString(),
  /** System-generated URL slug based on the SKU's name */
  slug: url,
  /** SKU flags combined as a bitfield */
  flags: asInteger(skuFlag)
});

export interface SKU extends v.InferOutput<typeof skuSchema> {}
