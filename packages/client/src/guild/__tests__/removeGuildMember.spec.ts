import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  removeGuildMember,
  removeGuildMemberProcedure,
  removeGuildMemberSafe,
  removeGuildMemberSchema
} from "../removeGuildMember.js";

describe(`removeGuildMember`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/members/:user`,
    removeGuildMemberSchema
  );

  it(`can be used standalone`, async () => {
    await expect(removeGuildMemberSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(removeGuildMemberProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(removeGuildMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
