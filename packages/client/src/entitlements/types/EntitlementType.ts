import { enum_ } from "valibot";

export const EntitlementType = {
  /** Entitlement was purchased by user */
  PURCHASE: 1,
  /** Entitlement for Discord Nitro subscription */
  PREMIUM_SUBSCRIPTION: 2,
  /** Entitlement was gifted by developer */
  DEVELOPER_GIFT: 3,
  /** Entitlement was purchased by a dev in application test mode */
  TEST_MODE_PURCHASE: 4,
  /** Entitlement was granted when the SKU was free */
  FREE_PURCHASE: 5,
  /** Entitlement was gifted by another user */
  USER_GIFT: 6,
  /** Entitlement was claimed by user for free as a Nitro Subscriber */
  PREMIUM_PURCHASE: 7,
  /** Entitlement was purchased as an app subscription */
  APPLICATION_SUBSCRIPTION: 8
} as const;

export const entitlementTypeSchema = enum_(EntitlementType);
