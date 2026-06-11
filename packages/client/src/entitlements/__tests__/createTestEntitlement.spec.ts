import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createTestEntitlement,
  createTestEntitlementSchema
} from "../createTestEntitlement.js";

describe(`createTestEntitlement`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/applications/:application/entitlements`,
    createTestEntitlementSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createTestEntitlement, createTestEntitlementSchema)(config)
    ).resolves.not.toThrow();
  });
});
