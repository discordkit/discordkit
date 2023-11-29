import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  modifyGuildRole,
  modifyGuildRoleProcedure,
  modifyGuildRoleSafe,
  modifyGuildRoleSchema
} from "../modifyGuildRole.js";
import { roleSchema } from "../types/Role.js";

describe(`modifyGuildRole`, () => {
  const expected = mockRequest.patch(`/guilds/:guild/roles/:role`, roleSchema);
  const config = mockSchema(modifyGuildRoleSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildRoleSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildRoleProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildRole);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
