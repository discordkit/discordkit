import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  removeGuildMemberRole,
  removeGuildMemberRoleProcedure,
  removeGuildMemberRoleSafe,
  removeGuildMemberRoleSchema
} from "../removeGuildMemberRole.js";

describe(`removeGuildMemberRole`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/members/:user/roles/:role`,
    removeGuildMemberRoleSchema
  );

  it(`can be used standalone`, async () => {
    await expect(removeGuildMemberRoleSafe(config)).resolves.not.toThrow();
  });

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
