import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createTestEntitlement,
  createTestEntitlementProcedure,
  createTestEntitlementSafe,
  createTestEntitlementSchema
} from "../createTestEntitlement.js";

describe(`createTestEntitlement`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/applications/:application/entitlements`,
    createTestEntitlementSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createTestEntitlementSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createTestEntitlementProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createTestEntitlement);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
