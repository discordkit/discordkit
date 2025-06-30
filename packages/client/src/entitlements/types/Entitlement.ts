import { snowflake } from "@discordkit/core";
import type { InferOutput } from "valibot";
import {
  boolean,
  exactOptional,
  isoTimestamp,
  nullable,
  object,
  pipe,
  string
} from "valibot";
import { entitlementTypeSchema } from "./EntitlementType.js";

export const entitlementSchema = object({
  /** ID of the entitlement */
  id: snowflake,
  /** ID of the SKU */
  skuId: snowflake,
  /** ID of the parent application */
  applicationId: snowflake,
  /** ID of the user that is granted access to the entitlement's sku */
  userId: exactOptional(snowflake),
  /** Type of entitlement */
  type: entitlementTypeSchema,
  /** Entitlement was deleted */
  deleted: boolean(),
  /** Start date at which the entitlement is valid. */
  startsAt: nullable(pipe(string(), isoTimestamp())),
  /** Date at which the entitlement is no longer valid. */
  endsAt: nullable(pipe(string(), isoTimestamp())),
  /** ID of the guild that is granted access to the entitlement's sku */
  guildId: exactOptional(snowflake),
  /** For consumable items, whether or not the entitlement has been consumed */
  consumed: exactOptional(boolean())
});

export type Entitlement = InferOutput<typeof entitlementSchema>;
