import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  updateUserApplicationRoleConnection,
  updateUserApplicationRoleConnectionProcedure,
  updateUserApplicationRoleConnectionSafe,
  updateUserApplicationRoleConnectionSchema
} from "../updateUserApplicationRoleConnection.ts";
import { applicationRoleConnectionSchema } from "../../application/types/ApplicationRoleConnection.ts";

describe(`updateUserApplicationRoleConnection`, () => {
  const expected = mockRequest.put(
    `/users/@me/applications/:application/role-connection`,
    applicationRoleConnectionSchema
  );
  const config = generateMock(updateUserApplicationRoleConnectionSchema);

  it(`can be used standalone`, async () => {
    await expect(
      updateUserApplicationRoleConnectionSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(updateUserApplicationRoleConnectionProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(updateUserApplicationRoleConnection);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
