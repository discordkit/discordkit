import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { subscriptionStatusSchema } from "./SubscriptionStatuses.js";

/**
 * The start of a subscription is determined by its ID. When the subscription renews, its current period is updated.
 *
 * If the user cancels the subscription, the subscription will enter the `ENDING` status and the `canceledAt` timestamp will reflect the time of the cancellation.
 */
export const subscriptionSchema = v.object({
  /** ID of the subscription */
  id: snowflake,
  /** ID of the user who is subscribed */
  userId: snowflake,
  /** List of SKUs subscribed to */
  skuIds: v.array(snowflake),
  /** List of entitlements granted for this subscription */
  entitlementIds: v.array(snowflake),
  /** List of SKUs that this user will be subscribed to at renewal */
  renewalSkuIds: v.nullable(v.array(snowflake)),
  /** Start of the current subscription period */
  currentPeriodStart: v.pipe(v.string(), v.isoTimestamp()),
  /** End of the current subscription period */
  currentPeriodEnd: v.pipe(v.string(), v.isoTimestamp()),
  /** Current status of the subscription */
  status: subscriptionStatusSchema,
  /** When the subscription was canceled */
  canceledAt: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
  /** ISO3166-1 alpha-2 country code of the payment source used to purchase the subscription. Missing unless queried with a private OAuth scope. */
  country: v.exactOptional(v.pipe(v.string(), v.nonEmpty()))
});

export interface Subscription
  extends v.InferOutput<typeof subscriptionSchema> {}
