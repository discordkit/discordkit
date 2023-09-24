import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteGuildRole,
  deleteGuildRoleProcedure,
  deleteGuildRoleSchema
} from "../deleteGuildRole";

describe(`deleteGuildRole`, () => {
  mockRequest.delete(`/guilds/:guild/roles/:role`);
  const config = generateMock(deleteGuildRoleSchema);

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
