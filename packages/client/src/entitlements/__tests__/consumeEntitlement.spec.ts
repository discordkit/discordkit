import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  consumeEntitlement,
  consumeEntitlementSchema
} from "../consumeEntitlement.js";

describe(`consumeEntitlement`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/applications/:application/entitlements/:entitlement/consume`,
    consumeEntitlementSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(consumeEntitlement, consumeEntitlementSchema)(config)
    ).resolves.not.toThrow();
  });
});
