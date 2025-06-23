import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  createGuildRole,
  createGuildRoleProcedure,
  createGuildRoleSafe,
  createGuildRoleSchema
} from "../createGuildRole.js";
import { roleSchema } from "../types/Role.js";

describe(`createGuildRole`, () => {
  const expected = mockRequest.post(`/guilds/:guild/roles`, roleSchema);
  const config = mockSchema(createGuildRoleSchema);

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
