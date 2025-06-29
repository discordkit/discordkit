import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  listSKUSubscriptionsProcedure,
  listSKUSubscriptionsQuery,
  listSKUSubscriptionsSafe,
  listSKUSubscriptionsSchema
} from "../listSKUSubscriptions.js";
import { subscriptionSchema } from "../types/Subscription.js";

describe(`listSKUSubscriptions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/skus/:sku/subscriptions`,
    listSKUSubscriptionsSchema,
    pipe(array(subscriptionSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(listSKUSubscriptionsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listSKUSubscriptionsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listSKUSubscriptionsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
