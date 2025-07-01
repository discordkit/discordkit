import * as v from "valibot";

/**
 * Subscriptions can start and change between any of these statuses within the current period. A subscription can be `ACTIVE` outside its current period or `INACTIVE` within its current period.
 *
 * Some examples of this behavior include:
 *
 * - While a failed payment is being retried, the subscription would remain `ACTIVE` until it succeeds or our system determines the payment is not recoverable.
 * - A refund or chargeback during the current period would make the subscription `INACTIVE`.
 *
 * > [!NOTE]
 * >
 * > Subscription status should not be used to grant perks. Use entitlements as an indication of whether a user should have access to a specific SKU. See our guide on [Implementing App Subscriptions](https://discord.com/developers/docs/monetization/implementing-app-subscriptions) for more information.
 */
export const SubscriptionStatuses = {
  /** Subscription is active and scheduled to renew. */
  ACTIVE: 0,
  /** Subscription is active but will not renew. */
  ENDING: 1,
  /** Subscription is inactive and not being charged. */
  INACTIVE: 2
} as const;

export const subscriptionStatusSchema = v.enum_(SubscriptionStatuses);
