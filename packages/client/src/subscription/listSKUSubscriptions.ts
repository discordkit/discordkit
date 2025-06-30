import {
  array,
  exactOptional,
  integer,
  maxValue,
  minValue,
  number,
  object,
  partial,
  pipe
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { subscriptionSchema, type Subscription } from "./types/Subscription.js";

export const listSKUSubscriptionsSchema = object({
  sku: snowflake,
  params: exactOptional(
    partial(
      object({
        /** List subscriptions before this ID (Default: undefined) */
        before: snowflake,
        /** List subscriptions after this ID (Default: undefined) */
        after: snowflake,
        /** Number of results to return (1-100) (Default: 50) */
        limit: pipe(number(), integer(), minValue(1), maxValue(100)),
        /** User ID for which to return subscriptions. Required except for OAuth queries. (Default: undefined) */
        userId: snowflake
      })
    )
  )
});

/**
 * ### [List SKU Subscriptions](https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions)
 *
 * **GET** `/skus/:sku/subscriptions`
 *
 * Returns all subscriptions containing the SKU, filtered by user. Returns a list of subscription objects.
 */
export const listSKUSubscriptions: Fetcher<
  typeof listSKUSubscriptionsSchema,
  Subscription[]
> = async ({ sku, params }) => get(`/skus/${sku}/subscriptions`, params);

export const listSKUSubscriptionsSafe = toValidated(
  listSKUSubscriptions,
  listSKUSubscriptionsSchema,
  array(subscriptionSchema)
);

export const listSKUSubscriptionsProcedure = toProcedure(
  `query`,
  listSKUSubscriptions,
  listSKUSubscriptionsSchema,
  array(subscriptionSchema)
);

export const listSKUSubscriptionsQuery = toQuery(listSKUSubscriptions);
