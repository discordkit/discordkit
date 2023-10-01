import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  deleteGuildRole,
  deleteGuildRoleProcedure,
  deleteGuildRoleSafe,
  deleteGuildRoleSchema
} from "../deleteGuildRole.ts";

describe(`deleteGuildRole`, () => {
  mockRequest.delete(`/guilds/:guild/roles/:role`);
  const config = generateMock(deleteGuildRoleSchema);

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
