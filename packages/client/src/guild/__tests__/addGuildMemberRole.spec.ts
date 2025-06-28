import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  addGuildMemberRole,
  addGuildMemberRoleProcedure,
  addGuildMemberRoleSafe,
  addGuildMemberRoleSchema
} from "../addGuildMemberRole.js";

describe(`addGuildMemberRole`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/guilds/:guild/members/:user/roles/:role`,
    addGuildMemberRoleSchema
  );

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
