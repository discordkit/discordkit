import type { GenericSchema, InferOutput } from "valibot";
import { nonEmpty, object, pipe, string, url } from "valibot";
import { asInteger, snowflake } from "@discordkit/core";
import { skuTypesSchema } from "./SKUTypes.js";
import { skuFlag } from "./SKUFlags.js";

/** SKUs (stock-keeping units) in Discord represent premium offerings that can be made available to your application's users or guilds. */
export const skuSchema = object({
  /** ID of SKU */
  id: snowflake,
  /** Type of SKU */
  type: skuTypesSchema,
  /** ID of the parent application */
  applicationId: snowflake,
  /** Customer-facing name of your premium offering */
  name: pipe(string(), nonEmpty()),
  /** System-generated URL slug based on the SKU's name */
  slug: pipe(string(), url()),
  /** SKU flags combined as a bitfield */
  flags: asInteger(skuFlag) as GenericSchema<number>
});

export type SKU = InferOutput<typeof skuSchema>;
