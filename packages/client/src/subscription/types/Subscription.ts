import {
  array,
  exactOptional,
  isoTimestamp,
  nonEmpty,
  nullable,
  object,
  pipe,
  string,
  type InferOutput
} from "valibot";
import { snowflake } from "@discordkit/core";
import { subscriptionStatusSchema } from "./SubscriptionStatuses.js";

/**
 * The start of a subscription is determined by its ID. When the subscription renews, its current period is updated.
 *
 * If the user cancels the subscription, the subscription will enter the `ENDING` status and the `canceledAt` timestamp will reflect the time of the cancellation.
 */
export const subscriptionSchema = object({
  /** ID of the subscription */
  id: snowflake,
  /** ID of the user who is subscribed */
  userId: snowflake,
  /** List of SKUs subscribed to */
  skuIds: array(snowflake),
  /** List of entitlements granted for this subscription */
  entitlementIds: array(snowflake),
  /** List of SKUs that this user will be subscribed to at renewal */
  renewalSkuIds: nullable(array(snowflake)),
  /** Start of the current subscription period */
  currentPeriodStart: pipe(string(), isoTimestamp()),
  /** End of the current subscription period */
  currentPeriodEnd: pipe(string(), isoTimestamp()),
  /** Current status of the subscription */
  status: subscriptionStatusSchema,
  /** When the subscription was canceled */
  canceledAt: nullable(pipe(string(), isoTimestamp())),
  /** ISO3166-1 alpha-2 country code of the payment source used to purchase the subscription. Missing unless queried with a private OAuth scope. */
  country: exactOptional(pipe(string(), nonEmpty()))
});

export type Subscription = InferOutput<typeof subscriptionSchema>;
