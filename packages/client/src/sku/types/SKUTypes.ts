import * as v from "valibot";

/** For subscriptions, SKUs will have a type of either `SUBSCRIPTION` represented by `type: 5` or `SUBSCRIPTION_GROUP` represented by `type: 6`. For any current implementations, you will want to use the SKU defined by `type: 5`. A `SUBSCRIPTION_GROUP` is automatically created for each `SUBSCRIPTION` SKU and are not used at this time. */
export const SKUTypes = {
  /** Durable one-time purchase */
  DURABLE: 2,
  /** Consumable one-time purchase */
  CONSUMABLE: 3,
  /** Represents a recurring subscription */
  SUBSCRIPTION: 5,
  /** System-generated group for each SUBSCRIPTION SKU created */
  SUBSCRIPTION_GROUP: 6
} as const;

export const skuTypesSchema = v.enum_(SKUTypes);
