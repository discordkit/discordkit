import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  updateCurrentUserApplicationRoleConnection,
  updateCurrentUserApplicationRoleConnectionProcedure,
  updateCurrentUserApplicationRoleConnectionSafe,
  updateCurrentUserApplicationRoleConnectionSchema
} from "../updateCurrentUserApplicationRoleConnection.js";
import { applicationRoleConnectionSchema } from "../types/ApplicationRoleConnection.js";

describe(`updateCurrentUserApplicationRoleConnection`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/users/@me/applications/:application/role-connection`,
    updateCurrentUserApplicationRoleConnectionSchema,
    applicationRoleConnectionSchema
  );

  it(`can be used standalone`, async () => {
    await expect(
      updateCurrentUserApplicationRoleConnectionSafe(config)
    ).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(updateCurrentUserApplicationRoleConnectionProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(updateCurrentUserApplicationRoleConnection);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
