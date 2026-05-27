import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { subscriptionSchema } from "../types/Subscription.js";
import {
  listSKUSubscriptionsSchema,
  listSKUSubscriptions
} from "../listSKUSubscriptions.js";

describe(`listSKUSubscriptions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/skus/:sku/subscriptions`,
    listSKUSubscriptionsSchema,
    v.pipe(v.array(subscriptionSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listSKUSubscriptions,
        listSKUSubscriptionsSchema,
        v.pipe(v.array(subscriptionSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
