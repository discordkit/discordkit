import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { entitlementTypeSchema } from "./EntitlementType.js";

export const entitlementSchema = v.object({
  /** ID of the entitlement */
  id: snowflake,
  /** ID of the SKU */
  skuId: snowflake,
  /** ID of the parent application */
  applicationId: snowflake,
  /** ID of the user that is granted access to the entitlement's sku */
  userId: v.exactOptional(snowflake),
  /** Type of entitlement */
  type: entitlementTypeSchema,
  /** Entitlement was deleted */
  deleted: v.boolean(),
  /** Start date at which the entitlement is valid. */
  startsAt: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
  /** Date at which the entitlement is no longer valid. */
  endsAt: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
  /** ID of the guild that is granted access to the entitlement's sku */
  guildId: v.exactOptional(snowflake),
  /** For consumable items, whether or not the entitlement has been consumed */
  consumed: v.exactOptional(v.boolean())
});

export interface Entitlement extends v.InferOutput<typeof entitlementSchema> {}
