import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteTestEntitlement,
  deleteTestEntitlementProcedure,
  deleteTestEntitlementSafe,
  deleteTestEntitlementSchema
} from "../deleteTestEntitlement.js";

describe(`deleteTestEntitlement`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/applications/:application/entitlements/:entitlement`,
    deleteTestEntitlementSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteTestEntitlementSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteTestEntitlementProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteTestEntitlement);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
