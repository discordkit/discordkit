import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  addGuildMemberRole,
  addGuildMemberRoleProcedure,
  addGuildMemberRoleSchema
} from "../addGuildMemberRole";

describe(`addGuildMemberRole`, () => {
  mockRequest.put(`/guilds/:guild/members/:user/roles/:role`);
  const config = generateMock(addGuildMemberRoleSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(addGuildMemberRoleProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(addGuildMemberRole);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
