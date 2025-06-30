import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGuildRole,
  createGuildRoleProcedure,
  createGuildRoleSafe,
  createGuildRoleSchema
} from "../createGuildRole.js";
import { roleSchema } from "../../permissions/Role.js";

describe(`createGuildRole`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/roles`,
    createGuildRoleSchema,
    roleSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createGuildRoleSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildRoleProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildRole);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
