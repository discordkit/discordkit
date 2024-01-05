import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  deleteGuildRole,
  deleteGuildRoleProcedure,
  deleteGuildRoleSafe,
  deleteGuildRoleSchema
} from "../deleteGuildRole.js";

describe(`deleteGuildRole`, () => {
  mockRequest.delete(`/guilds/:guild/roles/:role`);
  const config = mockSchema(deleteGuildRoleSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteGuildRoleSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildRoleProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuildRole);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
