import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  addGuildMemberRole,
  addGuildMemberRoleProcedure,
  addGuildMemberRoleSafe,
  addGuildMemberRoleSchema
} from "../addGuildMemberRole.js";

describe(`addGuildMemberRole`, () => {
  mockRequest.put(`/guilds/:guild/members/:user/roles/:role`);
  const config = mockSchema(addGuildMemberRoleSchema);

  it(`can be used standalone`, async () => {
    await expect(addGuildMemberRoleSafe(config)).resolves.not.toThrow();
  });

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
