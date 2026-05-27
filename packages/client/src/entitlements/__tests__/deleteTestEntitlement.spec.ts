import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  deleteTestEntitlement,
  deleteTestEntitlementSchema
} from "../deleteTestEntitlement.js";

describe(`deleteTestEntitlement`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/applications/:application/entitlements/:entitlement`,
    deleteTestEntitlementSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteTestEntitlement, deleteTestEntitlementSchema)(config)
    ).resolves.not.toThrow();
  });
});
