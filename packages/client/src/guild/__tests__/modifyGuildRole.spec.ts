import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuildRole,
  modifyGuildRoleProcedure,
  modifyGuildRoleSafe,
  modifyGuildRoleSchema
} from "../modifyGuildRole.js";
import { roleSchema } from "../../permissions/Role.js";

describe(`modifyGuildRole`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/roles/:role`,
    modifyGuildRoleSchema,
    roleSchema
  );

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
