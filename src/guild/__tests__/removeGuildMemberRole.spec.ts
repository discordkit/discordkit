import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  removeGuildMemberRole,
  removeGuildMemberRoleProcedure,
  removeGuildMemberRoleSchema
} from "../removeGuildMemberRole";

describe(`removeGuildMemberRole`, () => {
  mockRequest.delete(`/guilds/:guild/members/:user/roles/:role`);
  const config = generateMock(removeGuildMemberRoleSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(removeGuildMemberRoleProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(removeGuildMemberRole);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
