import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  updateUserApplicationRoleConnection,
  updateUserApplicationRoleConnectionProcedure,
  updateUserApplicationRoleConnectionSafe,
  updateUserApplicationRoleConnectionSchema
} from "../updateUserApplicationRoleConnection.js";
import { applicationRoleConnectionSchema } from "../../application/types/ApplicationRoleConnection.js";

describe(`updateUserApplicationRoleConnection`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/users/@me/applications/:application/role-connection`,
    updateUserApplicationRoleConnectionSchema,
    applicationRoleConnectionSchema
  );

  it(`can be used standalone`, async () => {
    await expect(
      updateUserApplicationRoleConnectionSafe(config)
    ).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(updateUserApplicationRoleConnectionProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(updateUserApplicationRoleConnection);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
